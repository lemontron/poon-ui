export const VStack = ({className, ...props}) => (
	<div className={`stack-v ${className}`} {...props}/>
);

export const HStack = ({className, ...props}) => (
	<div className={`stack-h ${className}`} {...props}/>
);

export const CStack = (props) => (
	<div className="stack-c" {...props}/>
);