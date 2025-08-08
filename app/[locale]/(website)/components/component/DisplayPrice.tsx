interface DisplayPriceProps {
  value: number | undefined;
  style?: string;
}

const DisplayPrice = ({value = 0, style}:DisplayPriceProps) => {  
  return (
    <span className={`${style || 'text-gray-800'}`}>${value} USD</span>
  );
};

export default DisplayPrice;