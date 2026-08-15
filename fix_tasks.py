from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

if 'TASK_INTERACTION_FIX_V1' in s:
    print('Task fix already present')
    raise SystemExit(0)

old_fb = """function fbToggleTask(taskId, done) {
  if (!fbSyncEnabled) return;
  fbUserDoc('tasks').doc(taskId).update({done: done});
}

function fbDeleteTask(taskId) {
  if (!fbSyncEnabled) return;
  fbUserDoc('tasks').doc(taskId).delete();
}"""
new_fb = """/* TASK_INTERACTION_FIX_V1 */
var fbPendingTaskToggles = Object.create(null);
var fbPendingTaskDeletes = Object.create(null);

function fbToggleTask(taskId, done) {
  if (!fbSyncEnabled || !taskId) return Promise.resolve();
  return fbUserDoc('tasks').doc(taskId).update({done: done});
}

function fbDeleteTask(taskId) {
  if (!fbSyncEnabled || !taskId) return Promise.resolve();
  return fbUserDoc('tasks').doc(taskId).delete();
}"""
if old_fb not in s:
    raise SystemExit('Expected Firebase task functions not found')
s = s.replace(old_fb, new_fb, 1)

old_listener = """    tasks = snap.docs.map(function(d){
      var data = d.data();
      // Ensure createdAt exists
      if (!data.createdAt) data.createdAt = new Date().toISOString();
      return Object.assign({id:d.id}, data);
    });"""
new_listener = """    tasks = snap.docs.map(function(d){
      var data = d.data();
      // Ensure createdAt exists
      if (!data.createdAt) data.createdAt = new Date().toISOString();
      if (fbPendingTaskToggles[d.id]) data.done = fbPendingTaskToggles[d.id];
      return Object.assign({id:d.id}, data);
    }).filter(function(t){
      return !fbPendingTaskDeletes[t.id];
    });"""
if old_listener not in s:
    raise SystemExit('Expected task realtime listener not found')
s = s.replace(old_listener, new_listener, 1)

old_handler = """document.getElementById('taskList').addEventListener('click', function(e){
  var el = e.target.closest('[data-action]'); if (!el) return;
  var i = parseInt(el.dataset.i);
  if (el.dataset.action==='check') tasks[i].done = !tasks[i].done;
  if (el.dataset.action==='del')   tasks.splice(i,1);
  saveTasks(); renderTasks(); calRender();
});"""
new_handler = """document.getElementById('taskList').addEventListener('click', function(e){
  var el = e.target.closest('[data-action]'); if (!el) return;
  var i = parseInt(el.dataset.i, 10);
  if (!Number.isInteger(i) || !tasks[i]) return;
  var task = tasks[i];
  var action = el.dataset.action;

  if (action === 'check') {
    var previousDone = !!task.done;
    var nextDone = !previousDone;
    task.done = nextDone;
    renderTasks();
    calRender();

    if (fbSyncEnabled && task.id) {
      var taskId = task.id;
      fbPendingTaskToggles[taskId] = nextDone;
      fbToggleTask(taskId, nextDone).then(function(){
        delete fbPendingTaskToggles[taskId];
      }).catch(function(err){
        delete fbPendingTaskToggles[taskId];
        var current = tasks.find(function(t){ return t.id === taskId; });
        if (current) current.done = previousDone;
        renderTasks();
        calRender();
        showToast('⚠️ Nepodařilo se uložit úkol');
        console.error('Task toggle failed:', err);
      });
    } else {
      saveTasks();
    }
    return;
  }

  if (action === 'del') {
    var removed = tasks.splice(i, 1)[0];
    renderTasks();
    calRender();

    if (fbSyncEnabled && removed && removed.id) {
      var deleteId = removed.id;
      fbPendingTaskDeletes[deleteId] = true;
      fbDeleteTask(deleteId).then(function(){
        delete fbPendingTaskDeletes[deleteId];
      }).catch(function(err){
        delete fbPendingTaskDeletes[deleteId];
        tasks.push(removed);
        tasks.sort(function(a,b){ return String(b.createdAt || '').localeCompare(String(a.createdAt || '')); });
        renderTasks();
        calRender();
        showToast('⚠️ Nepodařilo se smazat úkol');
        console.error('Task delete failed:', err);
      });
    } else {
      saveTasks();
    }
  }
});"""
if old_handler not in s:
    raise SystemExit('Expected task click handler not found')
s = s.replace(old_handler, new_handler, 1)

p.write_text(s, encoding='utf-8')
print('Task interaction fix applied')
