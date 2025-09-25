const express = require('express');

const server = express();
server.use(express.json());

let taskList = [
  { uid: 1, label: 'go gym', done: false },
  { uid: 2, label: 'Finish homework', done: true },
  { uid: 'a3', label: 'take coffee', done: false },
];

async function fetchTasks() {
  return Promise.resolve(taskList);
}

async function fetchTaskByUid(uid) {
  const task = taskList.find(t => String(t.uid) === String(uid));
  return Promise.resolve(task || null);
}

async function removeTask(uid) {
  const index = taskList.findIndex(t => String(t.uid) === String(uid));
  if (index === -1) return Promise.resolve(false);
  taskList.splice(index, 1);
  return Promise.resolve(true);
}
// Routes
server.get('/api/tasks', async (req, res, next) => {
  try {
    const data = await fetchTasks();
    res.status(200).json({ data, count: data.length });
  } catch (err) {
    next(err);
  }
});

server.get('/api/tasks/:uid', async (req, res, next) => {
  try {
    const uid = req.params.uid;
    const task = await fetchTaskByUid(uid);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
});

server.delete('/api/tasks/:uid', async (req, res, next) => {
  try {
    const uid = req.params.uid;
    const deleted = await removeTask(uid);
    if (!deleted) return res.status(404).json({ message: 'Task not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

server.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Unexpected server error' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Task API is running at http://localhost:${PORT}`);
});
