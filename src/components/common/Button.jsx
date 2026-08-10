// Komponen Button reusable untuk seluruh aplikasi
const Button = ({ children, variant = 'primary', size = 'md', onClick, disabled, className = '', ...props }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} btn-${size} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
