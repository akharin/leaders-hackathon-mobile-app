interface INotificationMessage {
	id: string;
	type: string;
	initiator?: {
		id: string;
		fullName: string;
	};
	date: string;
	fields?: {};
	htmlMessage: string;
}

export default INotificationMessage;
