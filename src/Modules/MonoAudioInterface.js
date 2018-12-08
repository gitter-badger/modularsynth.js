import React, { Component } from 'react';
import { compose, setStatic } from 'recompose';
import { connect } from 'react-redux';
import { connectModules, registerInputs } from '../actions';
import Port from './Port';

class StereoAudioInterface extends Component {
    constructor(props){
        super(props);
        if (!props.audioContext) throw new Error('audioContext property must be provided');
    }

    componentWillMount() {
        const { id, registerInputs } = this.props;
        registerInputs(id, {
            Line: {
                connect: port => port.audioNode.connect(this.props.audioContext.destination),
                disconnect: port => port.audioNode.disconnect(this.props.audioContext.destination)
            }
        })
    }

    render(){
        const { id, connections } = this.props;
        return <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span>
                { id }
            </span>
            Line:
            <Port portId='Line' connections={connections} moduleId={id} portType='input'/>
        </div>;
    }
}

const mapStateToProps = (state, ownProps) => ({
    connections: state.connections[ownProps.id]
});

export default compose(
    setStatic('isBrowserSupported', true),
    connect(mapStateToProps, { connectModules, registerInputs })
)(StereoAudioInterface);