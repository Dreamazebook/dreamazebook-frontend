interface DisplayPriceProps {
  value: number | string;
  discount?: number | undefined;
  style?: string;
}

const DisplayPrice = ({value = 0, discount, style}:DisplayPriceProps) => {
  let formatedValue: string;
  if (typeof value === 'string') {
    // Validate string parsing to avoid NaN
    const parsed = Math.abs(parseFloat(value));
    formatedValue = Number.isFinite(parsed) ? parsed.toFixed(2) : '0.00';
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
    <span className={`${style || 'text-gray-800'}`}>{typeof value === 'number' && value < 0 ? '-' : ''}${formatedValue} USD</span>
  );
};

export default DisplayPrice;