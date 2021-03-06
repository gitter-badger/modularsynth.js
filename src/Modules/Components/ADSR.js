import React, { Component } from 'react';
import { compose, setStatic, withState } from 'recompose';
import { connect } from 'react-redux';
import { connectModules, registerInputs, registerOutputs } from '../actions';
import Port from '../../Common/Port';
import Knob from '../../Common/Knob';
import { listenToFirstAudioParam } from '../portHelpers';

class ADSR extends Component {
    constructor(props) {
        super(props);
        if (!props.audioContext) throw new Error("audioContext property must be provided");

        this._adsr = props.audioContext.createConstantSource();        
        this._adsr.offset.value = -1;
        this._adsr.start();
        this.handleGateInChange = this.handleGateInChange.bind(this);        
    }

    componentWillMount() {
        const { id, registerInputs, registerOutputs } = this.props;        
        registerInputs(id, {
            Gate: {
                connect: audioNode => this._gateInterval = listenToFirstAudioParam(audioNode, this.handleGateInChange),
                disconnect: () => {
                    if (this._gateInterval) {
                        clearInterval((this._gateInterval));
                        this._gateInterval = null;
                    }
                }
            }
        });
        registerOutputs(id, {
           Out: this._adsr
        });
    }

    handleGateInChange(value) {    
        const { attack, decay, sustain, release, audioContext } = this.props;
        const now = audioContext.currentTime;
        const offset = this._adsr.offset;

        if (value === 1) {
            offset.cancelScheduledValues(0);
            offset.linearRampToValueAtTime(-1, now + 0.01);
            offset.linearRampToValueAtTime(0, now + attack);
            offset.linearRampToValueAtTime(sustain - 1, now + attack + decay);
        } else if (value === 0) {
            offset.cancelScheduledValues(0);
            offset.setValueAtTime(offset.value, now);
            offset.linearRampToValueAtTime(-1, now + release);
        }
    }

    render() {
        const { id, connections, attack, setAttack, decay, setDecay,
            sustain, setSustain, release, setRelease } = this.props;        
        return <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span>ADSR</span>
            Attack:
            <Knob min={0.01} max={15} step={0.01} value={attack} onChange={value => setAttack(Number(value))} width={30} height={30}/>
            Decay:
            <Knob min={0.01} max={15} step={0.01} value={decay} onChange={value => setDecay(Number(value))} width={30} height={30}/>
            Sustain:
            <Knob min={0} max={1} step={0.01} value={sustain} onChange={value => setSustain(Number(value))} width={30} height={30}/>
            Release:
            <Knob min={0.01} max={15} step={0.01} value={release} onChange={value => setRelease(Number(value))} width={30} height={30}/>
            <Port portId='Gate' connections={connections} moduleId={id} portType='input'/>
            <Port portId='Out' connections={connections} moduleId={id} portType='output'/>
        </div>;
    }
}

const mapStateToProps = ({ modules }, ownProps) => ({
    connections: modules.connections[ownProps.id]
});

export default compose(
    setStatic('isBrowserSupported', typeof ConstantSourceNode !== 'undefined'),
    setStatic('panelWidth', 6),
    withState('attack', 'setAttack', 0.01),
    withState('decay', 'setDecay', 0.6),
    withState('sustain', 'setSustain', 0.5),
    withState('release', 'setRelease', 0.5),
    connect(mapStateToProps, { connectModules, registerInputs, registerOutputs })
)(ADSR);