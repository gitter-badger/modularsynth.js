import React, { Component } from 'react';
import { connect } from 'react-redux';
import { connectModules, registerInputs } from '../actions';
import { getAllOutputs } from './selectors';
import Port from './Port';

class AudioInterface extends Component {
    constructor(props){
        super(props);
        if (!props.audioContext) throw new Error('audioContext property must be provided');

        this._leftPanner = new StereoPannerNode(props.audioContext, { pan: -1 });
        this._rightPanner = new StereoPannerNode(props.audioContext, { pan: 1 });
        this._leftPanner.connect(props.audioContext.destination);
        this._rightPanner.connect(props.audioContext.destination);
    }

    componentWillMount() {
        const { id, registerInputs } = this.props;
        registerInputs(id, {
            Left: {
                connect: port => port.audioNode.connect(this._leftPanner),
                disconnect: port => port.audioNode.disconnect(this._leftPanner)
            },
            Right: {
                connect: port => port.audioNode.connect(this._rightPanner),
                disconnect: port => port.audioNode.disconnect(this._rightPanner)
            }
        })
    }

    render(){
        const { id, connections, possibleOutputs } = this.props;
        return <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span>
                { id }
            </span>
            Left:
            <Port portId='Left' connections={connections} possiblePorts={possibleOutputs} moduleId={id} portType='input'/>
            Right:
            <Port portId='Right' connections={connections} possiblePorts={possibleOutputs} moduleId={id} portType='input'/>
        </div>;
    }
}

const mapStateToProps = (state, ownProps) => ({
    connections: state.connections[ownProps.id],
    possibleOutputs: getAllOutputs(state)
});

export default connect(mapStateToProps, { connectModules, registerInputs })(AudioInterface);