"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./logincard.module.css";

const LoginCard: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => router.push("/user_profile");
  const handleSignup = () => router.push("/user_profile");

  return (
    <div className="w-full flex justify-center">
      <div className={styles.loginContainer}>
        <h1 className={styles.loginText}>Login</h1>
        <label className={styles.boxLabels} htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          className={styles.inputBox}
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label className={styles.boxLabels} htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          className={styles.inputBox}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin} className={styles.loginButton}>
          <span className={styles.loginButtonLabel}>Login</span>
        </button>
        <div onClick={handleSignup} className={styles.signupLink}>
          Sign Up
        </div>
      </div>
    </div>
  );
};

export default LoginCard;