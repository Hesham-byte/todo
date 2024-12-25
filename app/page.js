'use client';

import {useEffect, useState} from 'react';
import {db} from './utils/firebase';
import {addDoc, collection, deleteDoc, doc, getDocs, updateDoc} from 'firebase/firestore';

export default function Home() {
    const [tasks, setTasks] = useState([]);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        const fetchTasks = async () => {
            const tasksCollection = collection(db, 'tasks');
            const tasksSnapshot = await getDocs(tasksCollection);
            const tasksList = tasksSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setTasks(tasksList);
        };

        fetchTasks();
    }, []);

    const addTask = async (text) => {
        if (!text.trim()) return;

        const newTask = {text, completed: false};
        const docRef = await addDoc(collection(db, 'tasks'), newTask);
        setTasks((prev) => [...prev, {id: docRef.id, ...newTask}]);
        setInputValue(''); // Clear input
    };

    const toggleTaskCompletion = async (taskId) => {
        const taskRef = doc(db, 'tasks', taskId);
        const taskToUpdate = tasks.find((task) => task.id === taskId);

        await updateDoc(taskRef, {
            completed: !taskToUpdate.completed,
        });

        setTasks((prev) =>
            prev.map((task) =>
                task.id === taskId ? {...task, completed: !task.completed} : task
            )
        );
    };

    const deleteTask = async (taskId) => {
        const taskRef = doc(db, 'tasks', taskId);
        await deleteDoc(taskRef);

        setTasks((prev) => prev.filter((task) => task.id !== taskId));
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200">
            <h1 className="text-4xl font-bold text-blue-600 mb-6">To-Do List</h1>
            <div className="w-full max-w-xl p-6 bg-white shadow-md rounded-lg">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        addTask(inputValue);
                    }}
                    className="flex gap-2 mb-6"
                >
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Add a new task..."
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    >
                        Add
                    </button>
                </form>
                <ul className="space-y-4">
                    {tasks.map((task) => (
                        <li
                            key={task.id}
                            className={`flex justify-between items-center border-b border-gray-200 pb-2 ${
                                task.completed ? 'line-through text-gray-400' : ''
                            }`}
                        >
                            <div className="flex gap-2 items-center">
                                <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() => toggleTaskCompletion(task.id)}
                                    className="w-5 h-5"
                                />
                                <span>{task.text}</span>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    className="text-red-500 hover:text-red-700 focus:outline-none"
                                    onClick={() => deleteTask(task.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}