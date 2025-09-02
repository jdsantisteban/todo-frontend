import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import DarkModeToggle from "../components/DarkModeToggle";

function Todos() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const inputRef = useRef(null);

  // Fetch todos on mount
  useEffect(() => {
    if (!token) navigate("/login");

    const fetchTodos = async () => {
      try {
        const res = await axios.get("https://todo-backend-kzy0.onrender.com/api/todos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTodos(res.data);
      } catch (err) {
        toast.error("Failed to fetch todos");
      }
    };

    fetchTodos();
  }, [navigate, token]);

  // Auto-focus edit input
  useEffect(() => {
    if (editingId && inputRef.current) inputRef.current.focus();
  }, [editingId]);

  // Logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Add Todo
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return toast.error("Todo cannot be empty");

    try {
      const promise = axios.post(
        "http://localhost:5000/api/todos",
        { text: newTodo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const res = await toast.promise(promise, {
        loading: "Adding todo...",
        success: "Todo added ✅",
        error: "Failed to add todo ❌",
      });
      setTodos([...todos, res.data]);
      setNewTodo("");
    } catch {}
  };

  // Edit handlers
  const startEdit = (todo) => {
    setEditingId(todo._id);
    setEditingText(todo.text);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };
  const handleEditKeyDown = (e, id) => {
    if (e.key === "Enter") saveEdit(id);
    if (e.key === "Escape") cancelEdit();
  };
  const saveEdit = async (id) => {
    if (!editingText.trim()) return toast.error("Todo text cannot be empty");

    try {
      const promise = axios.put(
        `http://localhost:5000/api/todos/${id}`,
        { text: editingText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const res = await toast.promise(promise, {
        loading: "Updating todo...",
        success: "Todo updated ✅",
        error: "Failed to update todo ❌",
      });
      setTodos(todos.map((todo) => (todo._id === id ? res.data : todo)));
      cancelEdit();
    } catch {}
  };

  // Delete Todo
  const deleteTodo = async (id) => {
    try {
      const promise = axios.delete(`http://localhost:5000/api/todos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await toast.promise(promise, {
        loading: "Deleting todo...",
        success: "Todo deleted 🗑️",
        error: "Failed to delete todo ❌",
      });
      setTodos(todos.filter((todo) => todo._id !== id));
    } catch {}
  };

  // Toggle completion
  const toggleTodo = async (id, completed) => {
    try {
      const promise = axios.put(
        `http://localhost:5000/api/todos/${id}`,
        { completed: !completed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const res = await toast.promise(promise, {
        loading: "Updating todo...",
        success: `Todo marked as ${!completed ? "done ✅" : "not done ⏳"}`,
        error: "Failed to update todo ❌",
      });
      setTodos(todos.map((todo) => (todo._id === id ? res.data : todo)));
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 shadow-md transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2 sm:mb-0">
            ToDo App
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
            <span className="text-gray-700 dark:text-gray-200">
              Hi, {username}
            </span>
            <div className="flex gap-2">
              <DarkModeToggle />
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="max-w-md sm:max-w-lg md:max-w-2xl mx-auto mt-6 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 transition-colors duration-300">
        {/* Add Todo */}
        <form
          className="flex flex-col sm:flex-row mb-4"
          onSubmit={handleAddTodo}
        >
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Enter todo"
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2 sm:mb-0 sm:mr-2 transition-colors"
          />
          <button className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-4 py-2 rounded transition-colors">
            Add
          </button>
        </form>

        {/* Todo List */}
        <ul>
          <AnimatePresence>
            {todos.map((todo) => (
              <motion.li
                key={todo._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                layout
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 bg-gray-100 dark:bg-gray-700 rounded mb-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              >
                {editingId === todo._id ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={(e) => handleEditKeyDown(e, todo._id)}
                    className="border rounded p-1 w-full mb-2 sm:mb-0 sm:mr-2 dark:bg-gray-600 dark:text-gray-200 transition-colors"
                  />
                ) : (
                  <span
                    onClick={() => toggleTodo(todo._id, todo.completed)}
                    className={`flex-1 cursor-pointer transition-colors duration-200 ${
                      todo.completed
                        ? "line-through text-gray-700 dark:text-gray-300"
                        : "hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-300"
                    } mb-2 sm:mb-0`}
                  >
                    {todo.text}
                  </span>
                )}

                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                  {editingId === todo._id ? (
                    <>
                      <button
                        onClick={() => saveEdit(todo._id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-2 py-1 rounded transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(todo)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteTodo(todo._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  );
}

export default Todos;
