const Alert = ({ type = 'error', message }) => {
  if (!message) return null;

  const styles = {
    error:   'border-red-500/30 bg-red-500/5 text-red-400',
    success: 'border-green-500/30 bg-green-500/5 text-green-400',
    info:    'border-blue-500/30 bg-blue-500/5 text-blue-400',
  };

  return (
    <div className={`border px-4 py-3 text-xs mb-6 ${styles[type]}`}>
      {message}
    </div>
  );
};

export default Alert;