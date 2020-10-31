interface INotificationSubscription {
	id: string;
	type: string;
	channels: string[];
	params: {};
}

export default INotificationSubscription;
