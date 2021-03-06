import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { TransitionGroup } from 'react-transition-group'
import { Context } from './Context'
import Wrapper from './Wrapper'
import Transition from './Transition'

class Provider extends Component {
  static propTypes = {
    offset: PropTypes.string,
    position: PropTypes.oneOf([
      'top left',
      'top right',
      'top center',
      'bottom left',
      'bottom right',
      'bottom center'
    ]),
    timeout: PropTypes.number,
    type: PropTypes.oneOf(['info', 'success', 'error']),
    transition: PropTypes.oneOf(['fade', 'scale']),
    zIndex: PropTypes.number,
    template: PropTypes.oneOfType([PropTypes.element, PropTypes.func])
      .isRequired
  }

  static defaultProps = {
    offset: '10px',
    position: 'top center',
    timeout: 0,
    type: 'info',
    transition: 'fade',
    zIndex: 100
  }

  state = {
    alerts: []
  }

  timerId = []

  show = (message = '', options = {}) => {
    const id = Math.random()
      .toString(36)
      .substr(2, 9)

    const { timeout, type } = this.props

    const alertOptions = {
      timeout,
      type,
      ...options
    }

    const alert = {
      id,
      message,
      options: alertOptions
    }

    alert.close = () => this.remove(alert)

    if (alert.options.timeout) {
      const timerId = setTimeout(() => {
        this.remove(alert)

        this.timerId.splice(this.timerId.indexOf(timerId), 1)
      }, alert.options.timeout)

      this.timerId.push(timerId)
    }

    this.setState(
      prevState => ({
        alerts: prevState.alerts.concat(alert)
      }),
      () => {
        alert.options.onOpen && alert.options.onOpen()
      }
    )

    return alert
  }

  remove = alert => {
    this.setState(prevState => {
      const lengthBeforeRemove = prevState.alerts.length
      const alerts = prevState.alerts.filter(a => a.id !== alert.id)

      if (lengthBeforeRemove > alerts.length && alert.options.onClose) {
        alert.options.onClose()
      }

      return { alerts }
    })
  }

  success = (message = '', options = {}) => {
    options.type = 'success'
    return this.show(message, options)
  }

  error = (message = '', options = {}) => {
    options.type = 'error'
    return this.show(message, options)
  }

  info = (message = '', options = {}) => {
    options.type = 'info'
    return this.show(message, options)
  }

  componentWillUnmount() {
    this.timerId.forEach(clearTimeout)
  }

  render() {
    const { alerts } = this.state

    const {
      children,
      offset,
      position,
      timeout,
      type,
      transition,
      zIndex,
      template: AlertComponent
    } = this.props

    const options = {
      offset,
      position,
      timeout,
      type,
      transition,
      zIndex
    }

    const alert = {
      ...this.state,
      show: this.show,
      remove: this.remove,
      success: this.success,
      error: this.error,
      info: this.info
    }

    return (
      <Context.Provider value={alert}>
        {children}
        <Wrapper options={options}>
          <TransitionGroup>
            {alerts.map(alert => (
              <Transition type={options.transition} key={alert.id}>
                <AlertComponent style={{ margin: options.offset }} {...alert} />
              </Transition>
            ))}
          </TransitionGroup>
        </Wrapper>
      </Context.Provider>
    )
  }
}

export default Provider
