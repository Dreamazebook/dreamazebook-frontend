interface DisplayPriceProps {
  value: number | undefined;
  discount?: number | undefined;
  style?: string;
}

const DisplayPrice = ({value = 0, discount, style}:DisplayPriceProps) => {
  if (typeof discount !== 'undefined') {
    return (
      <span className={`${style || 'text-gray-800'} space-x-3`}>
        <span className="ml-2">${discount} USD</span>
        <span className="line-through text-gray-400 font-light">${value} USD</span>
      </span>
    );
  }
  return (
    <span className={`${style || 'text-gray-800'}`}>${value} USD</span>
  );
};

export default DisplayPrice;