import React from 'react'
import { Select, SelectorInput, SummaryCard } from '../../components'
import { guaranteeOptions, selectGuarantee } from './constants'
import { totalAmount, installmentValue, monthlyFee, realLoanValue, maxLoan } from '../../lib/utils'
import './styles.css'

export class Simulator extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedInstallments: 24,
      guaranteeValue: 1000000,
      loanValue: 3000,
      maxLoan: guaranteeOptions.vehicle.maxLoan,
      selectedGuarantee: guaranteeOptions.vehicle,
      finalAmount: totalAmount(3000, 24),
    }
  }

  changeState = (name, value) => {
    this.setState({
      [name]: value,
    },
    () => {
      if (name === 'guaranteeValue'){
        this.setMaxLoan()
      }
      return this.setState({
        finalAmount: totalAmount(
          this.state.loanValue,
          this.state.selectedInstallments,
        )
      })
    })
  }

  setMaxLoan = () => {
    const guaranteeMaxLoan = this.state.selectedGuarantee.maxLoan
    const valueMaxLoan = maxLoan(this.state.guaranteeValue)
    const actualLoanValue = this.state.loanValue > valueMaxLoan ?
      valueMaxLoan :
      this.state.loanValue
    this.setState({
      maxLoan: guaranteeMaxLoan < valueMaxLoan ? guaranteeMaxLoan : valueMaxLoan,
      loanValue: actualLoanValue < this.state.selectedGuarantee.minLoan ?
        this.state.selectedGuarantee.minLoan :
        actualLoanValue
    })
  }

  changeGuarantee = (name, value) => {
    return this.setState({
      selectedGuarantee: guaranteeOptions[value],
      guaranteeValue: 1.25*guaranteeOptions[value].minLoan,
      loanValue: guaranteeOptions[value].minLoan,
      selectedInstallments: guaranteeOptions[value].installments[0].value,
      maxLoan: guaranteeOptions[value].maxLoan,
      finalAmount: totalAmount(
        guaranteeOptions[value].minLoan,
        guaranteeOptions[value].installments[0].value,
      )
    }, () => this.setMaxLoan())
  }

  sendData = (e) => {
    e.preventDefault()
    console.log(this.state)
  }

  render () {
    const { finalAmount, selectedInstallments, loanValue, guaranteeValue, maxLoan } = this.state
    const { minLoan, installments } = this.state.selectedGuarantee
    return (
      <main className="main">
        <h1 className="main__title">Realize uma simulação de crédito utilizando seu bem como garantia.</h1>
        <section className="section__container">
          <form className="form" name="form" method="POST" onSubmit={this.sendData}>
            <div className="form__fields">
              <div className="field-group">
                <Select
                  inputId="selectedInstallments"
                  label="Número de parcelas"
                  options={installments}
                  onChange={this.changeState}
                />
                <Select
                  inputId="guarantee"
                  label="Garantia"
                  options={selectGuarantee}
                  onChange={this.changeGuarantee}
                />
              </div>
              <div className="valor-garantia">
                <SelectorInput
                  hideRange
                  inputId="guaranteeValue"
                  label="Valor da Garantia"
                  value={guaranteeValue}
                  min={1.25*minLoan}
                  max={9000000}
                  onChange={this.changeState}
                />
              </div>
              <div className="emprestimo">
                <SelectorInput
                  inputId="loanValue"
                  label="Valor do Empréstimo"
                  value={loanValue}
                  min={minLoan}
                  max={maxLoan}
                  onChange={this.changeState}
                />
              </div>
            </div>
            <SummaryCard
              installmentAmount={installmentValue(finalAmount, selectedInstallments)}
              amount={finalAmount}
              feeRate={
                monthlyFee(
                  installmentValue(
                    finalAmount,
                    selectedInstallments
                  ),
                  realLoanValue(loanValue, guaranteeValue),
                  selectedInstallments
                )
              }
            />
          </form>
        </section>
        <footer className="footer">*O valor do empréstimo pode ser de até 80% do valor da garantia declarada.*</footer>
      </main>
    )
  }
}
