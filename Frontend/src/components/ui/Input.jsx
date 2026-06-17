const Input = ({ label, error, ...props }) => {
  return (
    <div className="mb-4">
      {label && <label className="label">{label}</label>}
      <input
        className={`input ${error ? 'border-red-500 focus:border-red-500' : ''}`}
        {...props}
      />
      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
    </div>
  );
};

export default Input;