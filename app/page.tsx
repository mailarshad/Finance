"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useUser, SignOutButton } from "@clerk/nextjs"; // Clerk imports

type Category = { id: string; name: string };
type Income = { id: number; amount: number; createdAt: string };
type Expense = { id: number; amount: number; category?: Category; createdAt: string };

export default function Dashboard() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);

  const [incomeAmount, setIncomeAmount] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const [aiTips, setAiTips] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const { user } = useUser();

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
  }, []);

  const addIncome = async () => {
    if (!incomeAmount) return alert("Enter amount");
    await fetch("/api/income", {
      method: "POST",
      body: JSON.stringify({ amount: parseFloat(incomeAmount) }),
      headers: { "Content-Type": "application/json" },
    });
    setIncomeAmount("");
    fetchData();
  };

  const addExpense = async () => {
    if (!expenseAmount) return alert("Enter amount");
    let categoryId = selectedCategory || null;
    if (newCategory) {
      const res = await fetch("/api/category", {
        method: "POST",
        body: JSON.stringify({ name: newCategory }),
        headers: { "Content-Type": "application/json" },
      });
      const newCat = await res.json();
      categoryId = newCat.id;
      setNewCategory("");
    }
    await fetch("/api/expense", {
      method: "POST",
      body: JSON.stringify({ amount: parseFloat(expenseAmount), categoryId }),
      headers: { "Content-Type": "application/json" },
    });
    setExpenseAmount("");
    setSelectedCategory("");
    fetchData();
  };

  const clearExpenses = async () => {
    if (!confirm("Clear all expenses?")) return;
    await fetch("/api/expense", { method: "DELETE" });
    fetchData();
  };

  const fetchSavingsTips = async () => {
    setAiLoading(true);
    setAiTips(null);
    const res = await fetch("/api/ai/suggestions", { method: "POST" });
    const data = await res.json();
    setAiTips(data.tips || "No tips available.");
    setAiLoading(false);
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
    
    <main className="min-h-screen bg-gradient-to-b from-[#0b0b0d] to-black text-white p-8 font-sans">
      {/* Title */}
       <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 bg-white/5 backdrop-blur-lg border-b border-white/10 px-6 py-4 flex items-center justify-between z-50"
      >
        <span className="text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
          Premium Finance
        </span>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-gray-300">
              {user.primaryEmailAddress?.emailAddress}
            </span>
          )}
          <SignOutButton>
            <button className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm font-semibold transition-transform hover:scale-105">
              Logout
            </button>
          </SignOutButton>
        </div>
      </motion.nav>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mt-16 text-center mb-2 bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent"
      >
        Premium Finance
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-gray-400 mb-10"
      >
        Take control of your financial future with intelligent tracking and AI-powered insights
      </motion.p>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { title: "Income", value: `$${totalIncome.toFixed(2)}`, color: "text-green-400", sub: "Current month" },
          { title: "Expenses", value: `$${totalExpenses.toFixed(2)}`, color: "text-red-400", sub: `${expenses.length} transactions` },
          { title: "Balance", value: `$${balance.toFixed(2)}`, color: "text-white", sub: "Surplus" },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform"
          >
            <p className="text-gray-400">{item.title}</p>
            <p className={`${item.color} text-3xl font-bold`}>{item.value}</p>
            <span className="text-xs text-gray-500">{item.sub}</span>
          </motion.div>
        ))}
      </div>

      {/* Add Income / Expense */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Add Income */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-lg"
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
          className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-lg"
        >
          <h2 className="font-bold mb-3">Add Expense</h2>
          <input
            type="number"
            placeholder="Enter amount"
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(e.target.value)}
            className="w-full p-2 rounded bg-black/40 text-white mb-3 border border-white/10"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 rounded bg-black/40 text-white mb-3 border border-white/10"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
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
        className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-lg mb-8"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold">Recent Transactions</h2>
          <button
            onClick={clearExpenses}
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm transition-transform hover:scale-105"
          >
            Clear All
          </button>
        </div>
        <div className="max-h-48 overflow-y-auto space-y-2">
          {expenses.map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="flex justify-between bg-black/40 border border-white/5 p-3 rounded-lg"
            >
              <div>
                <p className="text-red-400 font-semibold">${e.amount.toFixed(2)}</p>
                <p className="text-sm text-gray-400">{e.category?.name || "Uncategorized"}</p>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(e.createdAt).toLocaleDateString()} {new Date(e.createdAt).toLocaleTimeString()}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* AI Savings Assistant */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-lg"
      >
        <h2 className="font-bold mb-2">AI Savings Assistant</h2>
        <p className="text-gray-400 text-sm mb-4">
          Get personalized savings recommendations based on your spending patterns and financial goals.
        </p>
        <button
          onClick={fetchSavingsTips}
          disabled={aiLoading}
          className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded font-semibold text-black transition-transform hover:scale-105"
        >
          {aiLoading ? "Loading..." : "Get AI Recommendations"}
        </button>
        {aiTips && (
          <pre className="mt-4 whitespace-pre-wrap bg-black/40 p-4 rounded text-white border border-white/5">
            {aiTips}
          </pre>
        )}
      </motion.div>
    </main>
  );
}
