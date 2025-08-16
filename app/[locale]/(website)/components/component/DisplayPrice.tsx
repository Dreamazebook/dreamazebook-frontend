interface DisplayPriceProps {
  value: number | undefined;
  style?: string;
}

const DisplayPrice = ({value = 0, style}:DisplayPriceProps) => {  
  return (
    <span className={`${style || 'text-gray-800'}`}>${value.toFixed(2)} USD</span>
  );
};

export default DisplayPrice;