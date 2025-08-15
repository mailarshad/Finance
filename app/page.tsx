"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Wallet,
  Globe,
  Shield,
  Sliders,
  Rocket,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const colors = {
    featureGradients: [
      "from-blue-500 to-indigo-500",
      "from-emerald-400 to-green-500",
      "from-purple-400 to-pink-500",
      "from-yellow-400 to-orange-500",
      "from-pink-400 to-rose-500",
      "from-cyan-400 to-blue-500",
    ],
  };

  const features = [
    {
      icon: BarChart,
      title: "Smart Insights",
      description:
        "AI-powered analytics that help you understand spending patterns and make better financial decisions.",
      gradient: colors.featureGradients[0],
    },
    {
      icon: Wallet,
      title: "Seamless Tracking",
      description:
        "Automatically categorize and track expenses across all your accounts and devices.",
      gradient: colors.featureGradients[1],
    },
    {
      icon: Globe,
      title: "Access Anywhere",
      description:
        "Manage your finances from web, mobile, or tablet — always synced in real time.",
      gradient: colors.featureGradients[2],
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description:
        "Your financial data is encrypted and protected with industry-leading security protocols.",
      gradient: colors.featureGradients[3],
    },
    {
      icon: Sliders,
      title: "Fully Customizable",
      description:
        "Adjust categories, budgets, and reports to perfectly match your lifestyle.",
      gradient: colors.featureGradients[4],
    },
    {
      icon: Rocket,
      title: "Future Ready",
      description:
        "Stay ahead with regular updates, new budgeting tools, and AI-driven improvements.",
      gradient: colors.featureGradients[5],
    },
  ];

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
      {/* Header */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200"
            : "bg-transparent"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold text-gray-900 tracking-tight"
          >
            SpendSense
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="https://github.com/mailarshad/Finance">
              <button className="bg-black text-white px-5 py-2 rounded-full font-medium hover:bg-gray-800 transition-colors">
                Get Code
              </button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-gray-900 text-2xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex flex-col gap-4">
              {["Features", "Docs", "Community", "Contribute"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <Link href="https://github.com/mailarshad/Finance">
                <button className="w-full bg-black text-white px-5 py-2 rounded-full font-medium hover:bg-gray-800 transition-colors">
                  Get Code
                </button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="flex flex-col justify-center items-center text-center px-6 pt-32 pb-20">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight max-w-3xl leading-tight">
          SpendSense – Master Your Money
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl">
          Take control of your finances with AI-powered tracking, smart
          insights, and secure management — all in one place.
        </p>
        <Link
          href="/dashboard"
          className="mt-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-full text-lg font-semibold shadow hover:opacity-90 transition-all"
        >
          Get Started
        </Link>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-14">
            Discover why SpendSense is your go-to finance companion
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-100 text-center text-gray-500 text-sm mt-auto">
        © {new Date().getFullYear()} SpendSense. All rights reserved.
      </footer>
    </div>
  );
}
