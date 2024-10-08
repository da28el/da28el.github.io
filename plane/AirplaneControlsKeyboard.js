import {
	Controls,
	Quaternion,
	Vector3
} from 'three';

const _changeEvent = { type: 'change' };

const _EPS = 0.000001;
const _tmpQuaternion = new Quaternion();

class AirplaneControls extends Controls {

	constructor( object, domElement = null ) {

		super( object, domElement );

		this.movementSpeed = 0.5;
		this.rollSpeed = 0.2;

		this.dragToLook = false;
		this.autoForward = true;

		// internals

		this._moveState = { up: 0, down: 0, left: 0, right: 0, forward: 0, back: 0, pitchUp: 0, pitchDown: 0, yawLeft: 0, yawRight: 0, rollLeft: 0, rollRight: 0 };
		this._moveVector = new Vector3( 0, 0, 0 );
		this._rotationVector = new Vector3( 0, 0, 0 );
		this._lastQuaternion = new Quaternion();
		this._lastPosition = new Vector3();
		this._status = 0;

		// event listeners

		this._onKeyDown = onKeyDown.bind( this );
		this._onKeyUp = onKeyUp.bind( this );

		//

		if ( domElement !== null ) {

			this.connect();

		}

	}

	connect() {

		window.addEventListener( 'keydown', this._onKeyDown );
		window.addEventListener( 'keyup', this._onKeyUp );

	}

	disconnect() {

		window.removeEventListener( 'keydown', this._onKeyDown );
		window.removeEventListener( 'keyup', this._onKeyUp );

	}

	dispose() {

		this.disconnect();

	}

	update( delta ) {

		if ( this.enabled === false ) return;

		const object = this.object;

		const moveMult = delta * this.movementSpeed;
		const rotMult = delta * this.rollSpeed;

		object.translateX( this._moveVector.x * moveMult );
		object.translateY( this._moveVector.y * moveMult );
		object.translateZ( this._moveVector.z * moveMult );

		_tmpQuaternion.set( this._rotationVector.x * rotMult, this._rotationVector.y * rotMult, this._rotationVector.z * rotMult, 1 ).normalize();
		object.quaternion.multiply( _tmpQuaternion );

		if (
			this._lastPosition.distanceToSquared( object.position ) > _EPS ||
			8 * ( 1 - this._lastQuaternion.dot( object.quaternion ) ) > _EPS
		) {

			this.dispatchEvent( _changeEvent );
			this._lastQuaternion.copy( object.quaternion );
			this._lastPosition.copy( object.position );

		}

	}

	// private

	_updateMovementVector() {

		const forward = ( this._moveState.forward || ( this.autoForward && ! this._moveState.back ) ) ? 1 : 0;

		this._moveVector.x = ( - this._moveState.left + this._moveState.right );
		this._moveVector.y = ( - this._moveState.down + this._moveState.up );
		this._moveVector.z = ( - forward + this._moveState.back );

		//console.log( 'move:', [ this._moveVector.x, this._moveVector.y, this._moveVector.z ] );

	}

	_updateRotationVector() {

		this._rotationVector.x = ( - this._moveState.pitchDown + this._moveState.pitchUp );
		this._rotationVector.y = ( - this._moveState.yawRight + this._moveState.yawLeft );
		this._rotationVector.z = ( - this._moveState.rollRight + this._moveState.rollLeft );

		//console.log( 'rotate:', [ this._rotationVector.x, this._rotationVector.y, this._rotationVector.z ] );

	}

	_getContainerDimensions() {

		if ( this.domElement != document ) {

			return {
				size: [ this.domElement.offsetWidth, this.domElement.offsetHeight ],
				offset: [ this.domElement.offsetLeft, this.domElement.offsetTop ]
			};

		} else {

			return {
				size: [ window.innerWidth, window.innerHeight ],
				offset: [ 0, 0 ]
			};

		}

	}

}

function onKeyDown( event ) {

	if ( event.altKey || this.enabled === false ) {

		return;

	}

	switch ( event.code ) {

		case 'ShiftLeft':
		case 'ShiftRight': this.movementSpeedMultiplier = 1.5; break;

		case 'KeyS': this._moveState.pitchUp = 2; break;
		case 'KeyW': this._moveState.pitchDown = 2; break;

		case 'KeyA': this._moveState.yawLeft = 1; break;
		case 'KeyD': this._moveState.yawRight = 1; break;

		case 'KeyQ': this._moveState.rollLeft = 3; break;
		case 'KeyE': this._moveState.rollRight = 3; break;

	}

	this._updateMovementVector();
	this._updateRotationVector();

}

function onKeyUp( event ) {

	if ( this.enabled === false ) return;

	switch ( event.code ) {

		case 'ShiftLeft':
		case 'ShiftRight': this.movementSpeedMultiplier = 1; break;

		case 'KeyS': this._moveState.pitchUp = 0; break;
		case 'KeyW': this._moveState.pitchDown = 0; break;

		case 'KeyA': this._moveState.yawLeft = 0; break;
		case 'KeyD': this._moveState.yawRight = 0; break;

		case 'KeyQ': this._moveState.rollLeft = 0; break;
		case 'KeyE': this._moveState.rollRight = 0; break;

	}

	this._updateMovementVector();
	this._updateRotationVector();

}

export { AirplaneControls };