const ZenCoinIcon = ({ value, options }) => {
  const {
    size = '40px',
    bgColor = '#d8b354',
    innerBgColor = '#3f3d3d',
    valueColor = '#d8b354',
    borderColor = 'transparent'
  } = options || {};

  return (
    <div
      className="zen-coin-component"
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`
      }}
    >
      <div
        className="zen-coin-inner"
        style={{
          backgroundColor: innerBgColor
        }}
      >
        <span
          className="zen-coin-value"
          style={{
            color: valueColor,
            fontSize: `calc(${size} * 0.4)`
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
};

export default ZenCoinIcon;
