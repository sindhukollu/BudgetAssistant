import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';

@Injectable()
export class EventBusService {
	eventListeners = {};
	eventsSubject;
	events: Observable<any>;

	constructor() {
		this.eventsSubject = new Subject();

		this.events = Observable.from(this.eventsSubject);

		this.events.subscribe(
			({ name, args }) => {
				if (this.eventListeners[name]) {
					for (const listener of this.eventListeners[name]) {
						listener(...args);
					}
				}
			});
	}

	emit(name: any, ...args) {
		if (!name) {
			throw new Error('Name of event to emit must be provided');
		}
		this.eventsSubject.next({
			name,
			args
		});
	}

	on(name, listener: (...args) => void) {
		if (!this.eventListeners[name]) {
			this.eventListeners[name] = [];
		}

		this.eventListeners[name].push(listener);
	}
}
