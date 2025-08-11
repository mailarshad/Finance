"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

type Category = { id: string; name: string };
type Income = { id: string; amount: number; createdAt: string };
type Expense = { id: string; amount: number; category?: Category; createdAt: string };

export default function Dashboard() {
  const { user, isLoaded, isSignedIn } = useUser();

  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);

  const [incomeAmount, setIncomeAmount] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");

  // AI tips state
  const [aiTips, setAiTips] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch all data
  const fetchData = async () => {
    try {
      const [catsRes, expsRes, incsRes] = await Promise.all([
        fetch("/api/category"),
        fetch("/api/expense"),
        fetch("/api/income"),
      ]);

      if (!catsRes.ok || !expsRes.ok || !incsRes.ok) {
        throw new Error("Failed to fetch one or more resources");
      }

      const cats = await catsRes.json();
      const exps = await expsRes.json();
      const incs = await incsRes.json();

      setCategories(cats);
      setExpenses(exps);
      setIncomes(incs);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setCategories([]);
      setExpenses([]);
      setIncomes([]);
    }
  };

  // Fetch data only when user is loaded and signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchData();
    }
  }, [isLoaded, isSignedIn]);

  // Add income
  const addIncome = async () => {
    if (!incomeAmount) return alert("Please enter an income amount.");
    try {
      const res = await fetch("/api/income", {
        method: "POST",
        body: JSON.stringify({ amount: parseFloat(incomeAmount) }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to add income");
      setIncomeAmount("");
      fetchData();
    } catch (error) {
      alert("Error adding income.");
      console.error(error);
    }
  };

  // Add expense with optional new category
  const addExpense = async () => {
    if (!expenseAmount) return alert("Please enter an expense amount.");
    let categoryId = selectedCategory || null;

    try {
      if (newCategory) {
        const res = await fetch("/api/category", {
          method: "POST",
          body: JSON.stringify({ name: newCategory }),
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to add category");
        const newCat = await res.json();
        categoryId = newCat.id;
        setNewCategory("");
      }

      const res = await fetch("/api/expense", {
        method: "POST",
        body: JSON.stringify({ amount: parseFloat(expenseAmount), categoryId }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to add expense");

      setExpenseAmount("");
      setSelectedCategory("");
      fetchData();
    } catch (error) {
      alert("Error adding expense.");
      console.error(error);
    }
  };

  // Clear all expenses
  const clearExpenses = async () => {
    if (!confirm("Are you sure you want to delete all expenses?")) return;
    try {
      const res = await fetch("/api/expense", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to clear expenses");
      fetchData();
    } catch (error) {
      alert("Error clearing expenses.");
      console.error(error);
    }
  };

  // Fetch AI savings tips
  const fetchSavingsTips = async () => {
    setAiLoading(true);
    setAiTips(null);

    try {
      const res = await fetch("/api/savings-tips", { method: "POST" });
      if (!res.ok) throw new Error("Failed to get AI tips");

      const data = await res.json();
      setAiTips(data.tips || "No tips available.");
    } catch (error) {
      console.error("Error fetching AI tips:", error);
      setAiTips("Error fetching tips.");
    } finally {
      setAiLoading(false);
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const lastIncome = incomes.length > 0 ? incomes[0].amount : 0; // incomes assumed ordered desc

  if (!isLoaded) return <p>Loading...</p>;
  if (!isSignedIn) return <p>Please sign in to view your dashboard.</p>;

  return (
    <main className="min-h-screen bg-black text-white p-8 font-sans">
      <header className="mb-10">
        <h1 className="text-4xl font-bold">💰 Personal Finance Tracker</h1>
        <p className="text-gray-400">Track your income & expenses with ease</p>
      </header>

      {/* Summary Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[{
          title: "Last Income",
          value: `Rs ${lastIncome.toFixed(2)}`
        }, {
          title: "Total Expenses",
          value: `Rs ${totalExpenses.toFixed(2)}`
        }, {
          title: "Balance",
          value: `Rs ${(lastIncome - totalExpenses).toFixed(2)}`
        }].map(({ title, value }) => (
          <div
            key={title}
            className="bg-white text-black rounded-xl p-6 shadow border border-gray-300"
          >
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-3xl font-bold">{value}</p>
          </div>
        ))}
      </section>

      {/* Add Income */}
      <section className="bg-white text-black rounded-xl p-6 mb-8 shadow">
        <h2 className="text-xl font-bold mb-4">Add Income</h2>
        <div className="flex gap-3">
          <input
            type="number"
            placeholder="Amount"
            value={incomeAmount}
            onChange={(e) => setIncomeAmount(e.target.value)}
            className="flex-1 p-2 rounded text-black"
          />
          <button
            onClick={addIncome}
            className="bg-black text-white px-4 py-2 rounded font-semibold hover:bg-gray-800"
          >
            Add
          </button>
        </div>
      </section>

      {/* Add Expense */}
      <section className="bg-white text-black rounded-xl p-6 mb-8 shadow">
        <h2 className="text-xl font-bold mb-4">Add Expense</h2>
        <div className="flex gap-3 mb-3">
          <input
            type="number"
            placeholder="Amount"
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(e.target.value)}
            className="flex-1 p-2 rounded text-black"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 rounded text-black"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 mb-3">
          <input
            placeholder="New Category (optional)"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-1 p-2 rounded text-black"
          />
          <button
            onClick={addExpense}
            className="bg-black text-white px-4 py-2 rounded font-semibold hover:bg-gray-800"
          >
            Add
          </button>
        </div>
      </section>

      {/* Expense History */}
      <section className="bg-white text-black rounded-xl p-6 shadow">
        <h2 className="text-xl font-bold mb-4">Expense History</h2>
        {expenses.length === 0 ? (
          <p className="text-gray-600">No expenses yet</p>
        ) : (
          <>
            <ul className="space-y-2 max-h-64 overflow-auto">
              {expenses.map((e) => (
                <li
                  key={e.id}
                  className="flex justify-between border-b border-gray-300 pb-1"
                >
                  <span>
                    Rs {e.amount.toFixed(2)}{" "}
                    {e.category ? `- ${e.category.name}` : ""}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(e.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
            <button
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500"
              onClick={clearExpenses}
            >
              Clear All Expenses
            </button>
          </>
        )}
      </section>

      {/* AI Savings Suggestions */}
      <section className="bg-white text-black rounded-xl p-6 mt-8 shadow">
        <h2 className="text-xl font-bold mb-4">AI Savings Suggestions</h2>
        <button
          onClick={fetchSavingsTips}
          disabled={aiLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 px-4 py-2 rounded font-semibold"
        >
          {aiLoading ? "Loading..." : "Get Savings Tips"}
        </button>

        {aiTips && (
          <pre className="mt-4 whitespace-pre-wrap bg-gray-100 p-4 rounded text-black">
            {aiTips}
          </pre>
        )}
      </section>
    </main>
  );
}
