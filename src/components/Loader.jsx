import "../App.css";

const Loader = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="loader">
        <div className="load-inner load-one"></div>
        <div className="load-inner load-two"></div>
        <div className="load-inner load-three"></div>
        <span className="text">Loading...</span>
      </div>
    </div>
  );
};

export default Loader;
