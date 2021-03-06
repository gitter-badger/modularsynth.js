import React, { Component } from 'react';
import { compose, withState } from 'recompose';

const MAX_ANGLE = 150;

// const Knob = ({ height = 50, width = 50, value, min, max, step, onChange, isMoving, setIsMoving }) => {
//     let _elem;
//
//     const handleMouseDown = e => {
//
//     };
//
//     const handleMouseMove = e => {
//         e.stopPropagation();
//         e.preventDefault();
//         if (e.buttons !== 1) return;
//
//         const { x, y, width, height } = _elem.getBoundingClientRect();
//         const middle = { x: x + width / 2, y: y + height / 2 };
//
//         const deltaX = e.clientX - middle.x;
//         const deltaY = e.clientY - middle.y;
//         console.log('tan', Math.atan2(deltaY, deltaX));
//         let angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
//         if (angle < 0) angle += 360;
//         angle -= 120;
//         if (angle < 0) angle += 360;
//
//         console.log('ang', angle);
//     };
//
//     const calculateValueAngle = () => {
//         const totalDistance = max - min;
//         const distanceFromMin = value - min;
//         const ratio = distanceFromMin / totalDistance;
//         return ratio * 2 * MAX_ANGLE;
//     };
//
//     return <img ref={elem => _elem = elem}
//         style={{ cursor: 'pointer', margin: 'auto', transform: `rotate(${calculateValueAngle()}deg)` }}
//         onMouseMove={handleMouseMove} onMouseDown={handleMouseMove}
//         alt='knob' src={require('./knob.svg')} height={height} width={width}/>
// };

class Knob extends Component {
    constructor(props) {
        super(props);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.calculateValueAngle = this.calculateValueAngle.bind(this);
    }

    componentWillMount() {
        document.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('mousemove', this.handleMouseMove);
    }

    handleMouseMove(e) {
        const { isMoving, onChange, value, max, min, step } = this.props;
        if (!isMoving) return;

        e.stopPropagation();
        e.preventDefault();
        if (e.buttons !== 1) return;

        const { x, y, width, height } = this._elem.getBoundingClientRect();
        const middle = { x: x + width / 2, y: y + height / 2 };

        const deltaX = e.clientX - middle.x;
        const deltaY = e.clientY - middle.y;
        let angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        if (angle < 0) angle += 360;
        angle -= 120;
        if (angle < 0) angle += 360;

        if (angle < 2.1 * MAX_ANGLE)
        {
            const ratio = angle / (2 * MAX_ANGLE);
            let newValue = ratio * (max - min) + min;
            newValue = Math.floor(newValue / step) * step;
            if (newValue > max) newValue = max;
            onChange(newValue);

        }
    }

    handleMouseDown(e) {
        e.stopPropagation();
        this.props.setIsMoving(true);
    }

    handleMouseUp() {
        this.props.setIsMoving(false);
    }

    calculateValueAngle() {
        const { min, max, value } = this.props;
        const totalDistance = max - min;
        const distanceFromMin = value - min;
        const ratio = distanceFromMin / totalDistance;
        return ratio * 2 * MAX_ANGLE;
    }

    render() {
        const { height = 50, width = 50 } = this.props;
        return <img ref={elem => { this._elem = elem; } }
                    style={{ cursor: 'pointer', margin: 'auto', transform: `rotate(${this.calculateValueAngle()}deg)` }}
                    onMouseDown={this.handleMouseDown}
                    alt='knob' src={require('./knob.svg')} height={height} width={width}/>;
    }
}

export default compose(
    withState('isMoving', 'setIsMoving', false)
)(Knob);