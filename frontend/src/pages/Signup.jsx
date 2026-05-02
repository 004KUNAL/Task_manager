import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Eye, EyeOff, Zap } from "lucide-react";

const Signup = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", role: "member" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim())           e.name     = "Name is required.";
    if (!form.email.trim())          e.email    = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.password)              e.password = "Password is required.";
    else if (form.password.length < 6) e.password = "Minimum 6 characters.";
    return e;
  };

  const handleChange = (e) => {
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) { setErrors(validationErrors); return; }

    try {
      setLoading(true);
      const { data } = await api.post("/auth/signup", form);
      login(data.token, data.user);
      toast.success("Account created! Welcome 🎉");
      navigate("/dashboard");
    } catch (err) {
      setErrors({ api: err.response?.data?.message || "Signup failed." });
    } finally {
      setLoading(false);
    }
  };

  const field = (label, name, type = "text", extra = {}) => (
    <div>
      <label className="form-label">{label}</label>
      <input
        id={`signup-${name}`}
        className="form-input"
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        style={{ borderColor: errors[name] ? "var(--color-danger)" : undefined }}
        {...extra}
      />
      {errors[name] && <p style={{ color: "var(--color-danger)", fontSize: 12, marginTop: 4 }}>{errors[name]}</p>}
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--color-bg)",
      backgroundImage: "radial-gradient(ellipse at 80% 50%, rgba(124,58,237,0.1) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(6,182,212,0.08) 0%, transparent 50%)"
    }}>
      <div className="glass-card fade-in" style={{ width: "100%", maxWidth: 440, padding: 40, margin: "20px 16px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px"
          }}>
            <Zap size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Create an account</h1>
          <p style={{ fontSize: 14, color: "var(--color-muted)" }}>Start managing tasks with your team</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {field("Full Name", "name", "text", { placeholder: "Jane Smith" })}
          {field("Email address", "email", "email", { placeholder: "you@example.com" })}

          {/* Password with toggle */}
          <div>
            <label className="form-label">Password</label>
            <div style={{ position: "relative" }}>
              <input
                id="signup-password"
                className="form-input"
                type={showPwd ? "text" : "password"}
                name="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                style={{ paddingRight: 42, borderColor: errors.password ? "var(--color-danger)" : undefined }}
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: "var(--color-muted)", display: "flex"
              }}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p style={{ color: "var(--color-danger)", fontSize: 12, marginTop: 4 }}>{errors.password}</p>}
          </div>

          {/* Role selection */}
          <div>
            <label className="form-label">Role</label>
            <select id="signup-role" name="role" className="form-input" value={form.role} onChange={handleChange}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* API error */}
          {errors.api && (
            <div style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--color-danger)"
            }}>
              {errors.api}
            </div>
          )}

          <button id="signup-submit" className="btn-primary" type="submit" disabled={loading}
            style={{ justifyContent: "center", padding: "12px", fontSize: 15, marginTop: 4, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "var(--color-muted)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#a78bfa", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
