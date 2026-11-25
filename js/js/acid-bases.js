/*
====================================================
7.1 ACID & BASES
CALCULATOR INTERFACE
====================================================
*/

"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* ==========================================
           ELEMENTS
        ========================================== */

        const calculatorType =
            document.getElementById(
                "calculatorType"
            );

        const concentrationInput =
            document.getElementById(
                "concentrationInput"
            );

        const constantInput =
            document.getElementById(
                "constantInput"
            );

        const constantLabel =
            document.getElementById(
                "constantLabel"
            );

        const constantHelp =
            document.getElementById(
                "constantHelp"
            );

        const calculateButton =
            document.getElementById(
                "calculateButton"
            );

        const resetButton =
            document.getElementById(
                "resetButton"
            );

        const resultPanel =
            document.getElementById(
                "resultPanel"
            );

        const errorPanel =
            document.getElementById(
                "errorPanel"
            );


        if (
            !calculatorType ||
            !concentrationInput ||
            !constantInput ||
            !calculateButton
        ) {

            return;

        }


        /* ==========================================
           UPDATE INPUTS
        ========================================== */

        function updateCalculatorFields() {

            const type =
                calculatorType.value;


            if (
                type === "weak-acid"
            ) {

                constantLabel.textContent =
                    "Ka";

                constantHelp.textContent =
                    "Example: 1.8 × 10⁻⁵ for ethanoic acid.";

                constantInput.placeholder =
                    "e.g. 1.8e-5";

                constantInput.disabled =
                    false;

            }


            else if (
                type === "weak-base"
            ) {

                constantLabel.textContent =
                    "Kb";

                constantHelp.textContent =
                    "Example: 1.8 × 10⁻⁵ for ammonia.";

                constantInput.placeholder =
                    "e.g. 1.8e-5";

                constantInput.disabled =
                    false;

            }


            else {

                constantLabel.textContent =
                    "Equilibrium constant";

                constantHelp.textContent =
                    "Not required for strong acids or bases.";

                constantInput.placeholder =
                    "Not required";

                constantInput.value =
                    "";

                constantInput.disabled =
                    true;

            }

        }


        calculatorType.addEventListener(
            "change",
            updateCalculatorFields
        );


        updateCalculatorFields();


        /* ==========================================
           FORMAT NUMBER
        ========================================== */

        function formatNumber(
            value,
            significantFigures = 5
        ) {

            if (
                !Number.isFinite(value)
            ) {

                return "—";

            }


            if (
                value === 0
            ) {

                return "0";

            }


            return Number(
                value.toPrecision(
                    significantFigures
                )
            ).toString();

        }


        function formatScientific(
            value
        ) {

            if (
                !Number.isFinite(value)
            ) {

                return "—";

            }


            return value.toExponential(3);

        }


        /* ==========================================
           SHOW ERROR
        ========================================== */

        function showError(message) {

            errorPanel.textContent =
                message;

            errorPanel.classList.add(
                "visible"
            );

            resultPanel.classList.remove(
                "visible"
            );

        }


        /* ==========================================
           CLEAR ERROR
        ========================================== */

        function clearError() {

            errorPanel.textContent =
                "";

            errorPanel.classList.remove(
                "visible"
            );

        }


        /* ==========================================
           RENDER RESULT
        ========================================== */

        function renderResult(result) {

            clearError();


            let concentrationRows = "";


            if (
                result.type ===
                "weak-acid"
            ) {

                concentrationRows = `

                    <div class="result-row">
                        <span>[HA]</span>
                        <strong>
                            ${formatScientific(result.HA)} M
                        </strong>
                    </div>

                    <div class="result-row">
                        <span>[A⁻]</span>
                        <strong>
                            ${formatScientific(result.A)} M
                        </strong>
                    </div>

                `;

            }


            else if (
                result.type ===
                "weak-base"
            ) {

                concentrationRows = `

                    <div class="result-row">
                        <span>[B]</span>
                        <strong>
                            ${formatScientific(result.B)} M
                        </strong>
                    </div>

                    <div class="result-row">
                        <span>[BH⁺]</span>
                        <strong>
                            ${formatScientific(result.BH)} M
                        </strong>
                    </div>

                `;

            }


            else if (
                result.type ===
                "strong-acid"
            ) {

                concentrationRows = `

                    <div class="result-row">
                        <span>[H⁺]</span>
                        <strong>
                            ${formatScientific(result.H)} M
                        </strong>
                    </div>

                    <div class="result-row">
                        <span>[OH⁻]</span>
                        <strong>
                            ${formatScientific(result.OH)} M
                        </strong>
                    </div>

                `;

            }


            else if (
                result.type ===
                "strong-base"
            ) {

                concentrationRows = `

                    <div class="result-row">
                        <span>[OH⁻]</span>
                        <strong>
                            ${formatScientific(result.OH)} M
                        </strong>
                    </div>

                    <div class="result-row">
                        <span>[H⁺]</span>
                        <strong>
                            ${formatScientific(result.H)} M
                        </strong>
                    </div>

                `;

            }


            let constantRows = "";


            if (
                result.Ka
            ) {

                constantRows += `

                    <div class="result-row">
                        <span>Kₐ</span>
                        <strong>
                            ${formatScientific(result.Ka)}
                        </strong>
                    </div>

                    <div class="result-row">
                        <span>pKₐ</span>
                        <strong>
                            ${formatNumber(result.pKa)}
                        </strong>
                    </div>

                `;

            }


            if (
                result.Kb
            ) {

                constantRows += `

                    <div class="result-row">
                        <span>Kᵦ</span>
                        <strong>
                            ${formatScientific(result.Kb)}
                        </strong>
                    </div>

                    <div class="result-row">
                        <span>pKᵦ</span>
                        <strong>
                            ${formatNumber(result.pKb)}
                        </strong>
                    </div>

                `;

            }


            const typeNames = {

                "strong-acid":
                    "Strong Acid",

                "strong-base":
                    "Strong Base",

                "weak-acid":
                    "Weak Acid",

                "weak-base":
                    "Weak Base"

            };


            const typeName =
                typeNames[result.type] ||
                "Acid/Base";


            resultPanel.innerHTML = `

                <div class="result-header">

                    <div>

                        <span class="result-label">
                            CALCULATION RESULT
                        </span>

                        <h3>
                            ${typeName}
                        </h3>

                    </div>

                    <div class="result-pH">

                        <span>
                            pH
                        </span>

                        <strong>
                            ${formatNumber(result.pH)}
                        </strong>

                    </div>

                </div>


                <div class="result-primary">

                    <div class="primary-result">

                        <span>
                            Hydrogen ion concentration
                        </span>

                        <strong>
                            ${formatScientific(result.H)} M
                        </strong>

                    </div>

                    <div class="primary-result">

                        <span>
                            Hydroxide ion concentration
                        </span>

                        <strong>
                            ${formatScientific(result.OH)} M
                        </strong>

                    </div>

                </div>


                <div class="calculation-results-grid">

                    <div class="result-group">

                        <h4>
                            Equilibrium
                        </h4>

                        ${concentrationRows}

                    </div>


                    <div class="result-group">

                        <h4>
                            Acid–Base Properties
                        </h4>

                        ${constantRows}

                        <div class="result-row">
                            <span>pOH</span>
                            <strong>
                                ${formatNumber(result.pOH)}
                            </strong>
                        </div>

                        <div class="result-row">
                            <span>Degree of dissociation, α</span>
                            <strong>
                                ${formatNumber(
                                    result.degreeOfDissociation
                                )}
                            </strong>
                        </div>

                        <div class="result-row">
                            <span>Percentage dissociation</span>
                            <strong>
                                ${formatNumber(
                                    result.percentDissociation
                                )} %
                            </strong>
                        </div>

                    </div>

                </div>


                <div class="calculation-note">

                    <strong>
                        Calculation conditions
                    </strong>

                    <p>
                        Results use
                        K<sub>w</sub> = 1.00 × 10⁻¹⁴
                        at 25 °C.
                        Weak-acid and weak-base calculations
                        solve the equilibrium rather than
                        automatically assuming a small-x approximation.
                    </p>

                </div>

            `;


            resultPanel.classList.add(
                "visible"
            );

        }


        /* ==========================================
           CALCULATE
        ========================================== */

        calculateButton.addEventListener(
            "click",
            () => {

                try {

                    clearError();


                    const type =
                        calculatorType.value;


                    const concentration =
                        Number(
                            concentrationInput.value
                        );


                    let result;


                    if (
                        type ===
                        "strong-acid"
                    ) {

                        result =
                            ChemistryEngine.strongAcid(
                                concentration
                            );

                    }


                    else if (
                        type ===
                        "strong-base"
                    ) {

                        result =
                            ChemistryEngine.strongBase(
                                concentration
                            );

                    }


                    else if (
                        type ===
                        "weak-acid"
                    ) {

                        const Ka =
                            Number(
                                constantInput.value
                            );


                        result =
                            ChemistryEngine.weakAcid(
                                concentration,
                                Ka
                            );

                    }


                    else if (
                        type ===
                        "weak-base"
                    ) {

                        const Kb =
                            Number(
                                constantInput.value
                            );


                        result =
                            ChemistryEngine.weakBase(
                                concentration,
                                Kb
                            );

                    }


                    else {

                        throw new Error(
                            "Please select a calculation type."
                        );

                    }


                    renderResult(result);

                }


                catch (error) {

                    showError(
                        error.message
                    );

                }

            }
        );


        /* ==========================================
           RESET
        ========================================== */

        resetButton.addEventListener(
            "click",
            () => {

                calculatorType.value =
                    "strong-acid";

                concentrationInput.value =
                    "";

                constantInput.value =
                    "";

                updateCalculatorFields();

                clearError();

                resultPanel.classList.remove(
                    "visible"
                );

            }
        );

    }

);
