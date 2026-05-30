function AuthInput({ label, type = "text", placeholder, name, value, onChange, error }) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
      />
      {error && <span className="auth-field__error">{error}</span>}
    </label>
  );
}

export default AuthInput;