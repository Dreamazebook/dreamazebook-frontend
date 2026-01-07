interface DisplayPriceProps {
  value: number | string;
  discount?: number | undefined;
  style?: string;
}

const DisplayPrice = ({value = 0, discount, style}:DisplayPriceProps) => {
  if (typeof value === 'undefined') {
    return <span className={`${style || 'text-gray-800'}`}>N/A</span>;
  }
  
  let formatedValue = value;
  if (typeof value === 'string') {
    formatedValue = parseFloat(value).toFixed(2);
  } else {
    formatedValue = Math.abs(value).toFixed(2);
  }

  if (typeof discount !== 'undefined') {
    return (
      <span className={`${style || 'text-gray-800'} space-x-3`}>
        <span className="ml-2">${discount} USD</span>
        <span className="line-through text-gray-400 font-light">${formatedValue} USD</span>
      </span>
    );
  }
  return (
    <span className={`${style || 'text-gray-800'}`}>{value<0 && '-'}${formatedValue} USD</span>
  );
};

export default DisplayPrice;