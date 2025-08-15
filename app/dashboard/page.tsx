"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { notifySuccess, notifyError } from "@/lib/notify.js";

type Category = { id: string; name: string };
type Income = { id: number; amount: number; createdAt: string };
type Expense = {
  id: number;
  amount: number;
  category?: Category;
  createdAt: string;
};

export default function Dashboard() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [incomeAmount, setIncomeAmount] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [currency, setCurrency] = useState("USD");
  const currencyOptions = ["USD", "EUR", "GBP", "PKR", "JPY", "INR"];
  const [aiTips, setAiTips] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const { user } = useUser();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en", { style: "currency", currency }).format(value);

  const fetchData = async () => {
    const [catsRes, expsRes, incsRes] = await Promise.all([
      fetch("/api/category"),
      fetch("/api/expense"),
      fetch("/api/income"),
    ]);
    setCategories(await catsRes.json());
    setExpenses(await expsRes.json());
    setIncomes(await incsRes.json());
  };

  useEffect(() => {
    fetchData();
    const savedCurrency =
      typeof window !== "undefined" ? localStorage.getItem("currency") : null;
    if (savedCurrency) setCurrency(savedCurrency);
  }, []);

  const handleCurrencyChange = (value: string) => {
    setCurrency(value);
    toast.info(`Currency changed to ${value}`);
    if (typeof window !== "undefined") {
      localStorage.setItem("currency", value);
    }
  };

  const addIncome = async () => {
    if (!incomeAmount) {
      toast.error("Please enter income amount");
      return;
    }
    await fetch("/api/income", {
      method: "POST",
      body: JSON.stringify({ amount: parseFloat(incomeAmount) }),
      headers: { "Content-Type": "application/json" },
    });
    setIncomeAmount("");
    toast.success("Income added successfully");
    fetchData();
  };

  const addExpense = async () => {
    if (!expenseAmount) {
      toast.error("Please enter expense amount");
      return;
    }
    let categoryId: string | null = selectedCategory || null;

    if (newCategory) {
      const res = await fetch("/api/category", {
        method: "POST",
        body: JSON.stringify({ name: newCategory }),
        headers: { "Content-Type": "application/json" },
      });
      const newCat = await res.json();
      categoryId = newCat.id;
      toast.success(`Category "${newCat.name}" created`);
      setNewCategory("");
      setSelectedCategory("");
    }

    await fetch("/api/expense", {
      method: "POST",
      body: JSON.stringify({ amount: parseFloat(expenseAmount), categoryId }),
      headers: { "Content-Type": "application/json" },
    });

    setExpenseAmount("");
    toast.success("Expense added successfully");
    fetchData();
  };

  const clearExpenses = async () => {
    if (!confirm("Clear all expenses?")) return;
    await fetch("/api/expense", { method: "DELETE" });
    toast.warn("All expenses cleared");
    fetchData();
  };

  const fetchSavingsTips = async () => {
    setAiLoading(true);
    setAiTips(null);
    const res = await fetch("/api/ai/suggestions", { method: "POST" });
    const data = await res.json();
    setAiTips(data.tips || "No tips available.");
    toast.success("AI tips loaded successfully");
    setAiLoading(false);
  };

  const deleteExpense = async (id: number) => {
    if (!confirm("Delete this expense?")) return;
    await fetch(`/api/expense/${id}`, { method: "DELETE" });
    toast.success("Expense deleted successfully");
    fetchData();
  };

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpenses;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0b0b0d] to-black text-white p-4 sm:p-8 font-sans">
      {/* Navbar */}

      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 bg-white/5 backdrop-blur-lg border-b border-white/10 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 z-50"
      >
        <span className="text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
          Premium Finance
        </span>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <select
            value={currency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="bg-black/40 border border-white/10 p-1 rounded text-sm w-full sm:w-auto"
          >
            {currencyOptions.map((cur) => (
              <option key={cur} value={cur}>
                {cur}
              </option>
            ))}
          </select>

          {user && (
            <div className="flex items-center gap-2">
              <img
                src={user.imageUrl}
                alt={user.firstName || "User"}
                className="w-8 h-8 rounded-full border border-white/20"
              />
              <span className="text-sm text-gray-300 truncate max-w-[120px] sm:max-w-none">
                {user.primaryEmailAddress?.emailAddress}
              </span>
            </div>
          )}

          <button
            onClick={async () => {
              if (!confirm("Are you sure? This will delete ALL your data."))
                return;
              await fetch("/api/clear-all", { method: "DELETE" });
              fetchData();
            }}
            className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded text-sm font-semibold transition-transform hover:scale-105 text-black w-full sm:w-auto"
          >
            Clear All Data
          </button>

          <SignOutButton redirectUrl="/sign-in">
            <button className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm font-semibold transition-transform hover:scale-105 w-full sm:w-auto">
              Logout
            </button>
          </SignOutButton>
        </div>
      </motion.nav>

      {/* Title */}
      <div className="pt-24 sm:pt-20">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl font-bold text-center mb-2 bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent"
        >
          Premium Finance
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-400 mb-10 text-sm sm:text-base px-2"
        >
          Take control of your financial future with intelligent tracking and
          AI-powered insights
        </motion.p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {[
          {
            title: "Income",
            value: formatCurrency(totalIncome),
            color: "text-green-400",
            sub: "Current month",
          },
          {
            title: "Expenses",
            value: formatCurrency(totalExpenses),
            color: "text-red-400",
            sub: `${expenses.length} transactions`,
          },
          {
            title: "Balance",
            value: formatCurrency(balance),
            color: "text-white",
            sub: "Surplus",
          },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="bg-white/5 backdrop-blur-lg border border-white/10 p-4 sm:p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform"
          >
            <p className="text-gray-400">{item.title}</p>
            <p className={`${item.color} text-2xl sm:text-3xl font-bold`}>
              {item.value}
            </p>
            <span className="text-xs text-gray-500">{item.sub}</span>
          </motion.div>
        ))}
      </div>

      {/* Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
        {/* Add Income */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 p-4 sm:p-6 rounded-2xl shadow-lg"
        >
          <h2 className="font-bold mb-3">Add Income</h2>
          <input
            type="number"
            placeholder="Enter amount"
            value={incomeAmount}
            onChange={(e) => setIncomeAmount(e.target.value)}
            className="w-full p-2 rounded bg-black/40 text-white mb-3 border border-white/10"
          />
          <button
            onClick={addIncome}
            className="bg-green-500 hover:bg-green-600 w-full py-2 rounded font-semibold transition-transform hover:scale-105"
          >
            Add Income
          </button>
        </motion.div>

        {/* Add Expense */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 p-4 sm:p-6 rounded-2xl shadow-lg"
        >
          <h2 className="font-bold mb-3">Add Expense</h2>
          <input
            type="number"
            placeholder="Enter amount"
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(e.target.value)}
            className="w-full p-2 rounded bg-black/40 text-white mb-3 border border-white/10"
          />
          <input
            placeholder="Or create new category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="w-full p-2 rounded bg-black/40 text-white mb-3 border border-white/10"
          />
          <button
            onClick={addExpense}
            className="bg-red-500 hover:bg-red-600 w-full py-2 rounded font-semibold transition-transform hover:scale-105"
          >
            Add Expense
          </button>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-lg border border-white/10 p-4 sm:p-6 rounded-2xl shadow-lg mb-8"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <h2 className="font-bold">Recent Transactions</h2>
          <button
            onClick={clearExpenses}
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm transition-transform hover:scale-105 w-full sm:w-auto"
          >
            Clear All
          </button>
        </div>
        <div className="max-h-48 overflow-y-auto space-y-2">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 border-b border-white/10"
            >
              <div>
                <p className="text-sm">
                  {expense.category?.name || "Uncategorized"}
                </p>
                <p className="text-gray-400 text-sm">
                  {formatCurrency(expense.amount)}
                </p>
              </div>
              <button
  onClick={async () => {
    try {
      const res = await fetch(`/api/expense/${expense.id}`, { method: "DELETE" });
      if (res.ok) {
        notifySuccess("Expense deleted!");
        fetchData();
      } else {
        notifyError("Failed to delete expense");
      }
    } catch (error) {
      notifyError("Something went wrong");
    }
  }}
  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold transition-transform hover:scale-105 mt-2 sm:mt-0 w-full sm:w-auto"
>
  Delete
</button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* AI Savings Assistant */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-lg border border-white/10 p-4 sm:p-6 rounded-2xl shadow-lg"
      >
        <h2 className="font-bold mb-2">AI Savings Assistant</h2>
        <p className="text-gray-400 text-sm mb-4">
          Get personalized savings recommendations based on your spending
          patterns and financial goals.
        </p>
        <button
          onClick={fetchSavingsTips}
          disabled={aiLoading}
          className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded font-semibold text-black transition-transform hover:scale-105 w-full sm:w-auto"
        >
          {aiLoading ? "Loading..." : "Get AI Recommendations"}
        </button>
        {aiTips && (
          <pre className="mt-4 whitespace-pre-wrap bg-black/40 p-4 rounded text-white border border-white/5 text-sm sm:text-base">
            {aiTips}
          </pre>
        )}
      </motion.div>
    </main>
  );
}
