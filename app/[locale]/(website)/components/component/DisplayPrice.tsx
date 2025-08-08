interface DisplayPriceProps {
  value: number;
  style?: string;
}

const DisplayPrice = ({value, style}:DisplayPriceProps) => {  
  return (
    <div className={`${style || 'text-gray-800'}`}>${value} USD</div>
  );
};

export default DisplayPrice;