type appProps = {
  name: string;
  handleClick: () => void;
};

const Button = ({ name, handleClick }: appProps) => {
  return (
    <>
      <button
        className="bg-lime-600 border rounded-md p-2  my-5 text-white w-full"
        onClick={handleClick}
      >
        {name}
      </button>
    </>
  );
};

export default Button;
