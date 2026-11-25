/*
====================================================
IONIC EQUILIBRIUM
CORE CHEMISTRY CALCULATION ENGINE
====================================================

This file contains pure chemistry calculations.

The functions here should NOT depend on HTML elements.
That allows the same chemistry engine to later be used by:

- calculators
- virtual laboratory
- graphs
- practice questions
- simulations

Reference temperature:
25 °C

Kw = 1.00 × 10^-14
====================================================
*/


"use strict";


/* ==================================================
   CONSTANTS
================================================== */

const CHEMISTRY_CONSTANTS = Object.freeze({

    Kw25: 1.00e-14,

    minimumConcentration: 1.00e-14,

    minimumEquilibriumValue: 1.00e-14,

    maximumConcentration: 1000

});


/* ==================================================
   GENERAL VALIDATION
================================================== */

function validatePositiveNumber(value, name) {

    const number = Number(value);

    if (!Number.isFinite(number)) {

        throw new Error(`${name} must be a valid number.`);

    }

    if (number <= 0) {

        throw new Error(`${name} must be greater than zero.`);

    }

    return number;

}


function validateConcentration(value) {

    const concentration =
        validatePositiveNumber(
            value,
            "Concentration"
        );

    if (
        concentration <
        CHEMISTRY_CONSTANTS.minimumConcentration
    ) {

        throw new Error(
            "Concentration is too small for this calculator."
        );

    }

    if (
        concentration >
        CHEMISTRY_CONSTANTS.maximumConcentration
    ) {

        throw new Error(
            "Concentration is outside the supported range."
        );

    }

    return concentration;

}


function validateConstant(value, name) {

    const constant =
        validatePositiveNumber(value, name);

    if (constant > 1e6) {

        throw new Error(
            `${name} is outside the supported range.`
        );

    }

    return constant;

}


/* ==================================================
   MATHEMATICAL HELPERS
================================================== */

function safeLog10(value) {

    if (
        !Number.isFinite(value) ||
        value <= 0
    ) {

        throw new Error(
            "Cannot calculate logarithm of this value."
        );

    }

    return Math.log10(value);

}


function calculatePohFromOH(OH) {

    return -safeLog10(OH);

}


function calculatePHFromH(H) {

    return -safeLog10(H);

}


function calculateOHFromH(H, Kw = CHEMISTRY_CONSTANTS.Kw25) {

    return Kw / H;

}


function calculateHFromOH(OH, Kw = CHEMISTRY_CONSTANTS.Kw25) {

    return Kw / OH;

}


/* ==================================================
   STRONG ACID
==================================================

For a monoprotic strong acid:

HA → H+ + A-

At finite dilution, water autoionisation is included.

Charge balance:

[H+] = [A-] + [OH-]

with:

Kw = [H+][OH-]

This gives:

[H+] =
(C + sqrt(C² + 4Kw)) / 2
================================================== */

function calculateStrongAcid(concentration) {

    const C =
        validateConcentration(concentration);

    const Kw =
        CHEMISTRY_CONSTANTS.Kw25;


    const H =
        (
            C +
            Math.sqrt(
                C * C +
                4 * Kw
            )
        ) / 2;


    const OH =
        Kw / H;


    const pH =
        calculatePHFromH(H);


    const pOH =
        calculatePohFromOH(OH);


    return {

        type: "strong-acid",

        initialConcentration: C,

        H,

        OH,

        pH,

        pOH,

        equilibriumAcidConcentration: H,

        equilibriumAnionConcentration:
            H - OH,

        degreeOfDissociation: 1,

        percentDissociation: 100,

        temperature: 25

    };

}


/* ==================================================
   STRONG BASE
==================================================

For a monoprotic strong base:

BOH → B+ + OH-

Water autoionisation is included.

[OH-] =
(C + sqrt(C² + 4Kw)) / 2
================================================== */

function calculateStrongBase(concentration) {

    const C =
        validateConcentration(concentration);

    const Kw =
        CHEMISTRY_CONSTANTS.Kw25;


    const OH =
        (
            C +
            Math.sqrt(
                C * C +
                4 * Kw
            )
        ) / 2;


    const H =
        Kw / OH;


    const pOH =
        calculatePohFromOH(OH);


    const pH =
        calculatePHFromH(H);


    return {

        type: "strong-base",

        initialConcentration: C,

        H,

        OH,

        pH,

        pOH,

        equilibriumBaseConcentration: OH,

        equilibriumCationConcentration:
            OH - H,

        degreeOfDissociation: 1,

        percentDissociation: 100,

        temperature: 25

    };

}


/* ==================================================
   NUMERICAL ROOT SOLVER
==================================================

Used for weak acid/base equilibrium.

A log-scale bisection method is used because
concentrations may span many orders of magnitude.

This avoids relying on the small-x approximation.
================================================== */

function solvePositiveRootLogScale(
    functionToSolve,
    minimum = 1e-14,
    maximum = 1
) {

    let low = minimum;
    let high = maximum;

    let fLow =
        functionToSolve(low);

    let fHigh =
        functionToSolve(high);


    /*
        If the initial interval does not bracket
        the root, expand the upper boundary.
    */

    let expansionCount = 0;

    while (
        fLow * fHigh > 0 &&
        expansionCount < 20
    ) {

        high *= 10;

        fHigh =
            functionToSolve(high);

        expansionCount++;

    }


    if (fLow * fHigh > 0) {

        throw new Error(
            "Unable to solve the equilibrium equation."
        );

    }


    for (let i = 0; i < 150; i++) {

        const logLow =
            Math.log10(low);

        const logHigh =
            Math.log10(high);

        const logMid =
            (logLow + logHigh) / 2;

        const mid =
            Math.pow(10, logMid);

        const fMid =
            functionToSolve(mid);


        if (
            Math.abs(fMid) < 1e-15 ||
            Math.abs(logHigh - logLow) < 1e-12
        ) {

            return mid;

        }


        if (fLow * fMid <= 0) {

            high = mid;
            fHigh = fMid;

        } else {

            low = mid;
            fLow = fMid;

        }

    }


    return Math.pow(
        10,
        (
            Math.log10(low) +
            Math.log10(high)
        ) / 2
    );

}


/* ==================================================
   WEAK ACID
==================================================

HA ⇌ H+ + A-

Ka = [H+][A-] / [HA]

Mass balance:

C = [HA] + [A-]

Using [H+] = h:

[A-] =
Ka*C / (Ka + h)

[OH-] =
Kw / h

Charge balance:

h = [A-] + [OH-]

The numerical solver finds h directly.

This remains valid even when the
small-x approximation is not appropriate.
================================================== */

function calculateWeakAcid(
    concentration,
    Ka
) {

    const C =
        validateConcentration(concentration);

    const acidConstant =
        validateConstant(
            Ka,
            "Ka"
        );

    const Kw =
        CHEMISTRY_CONSTANTS.Kw25;


    const chargeBalance =
        (H) => {

            const A =
                (
                    acidConstant * C
                ) /
                (
                    acidConstant + H
                );


            const OH =
                Kw / H;


            return H - A - OH;

        };


    const H =
        solvePositiveRootLogScale(
            chargeBalance,
            1e-14,
            Math.max(1, C)
        );


    const A =
        (
            acidConstant * C
        ) /
        (
            acidConstant + H
        );


    const HA =
        C - A;


    const OH =
        Kw / H;


    const pH =
        calculatePHFromH(H);


    const pOH =
        calculatePohFromOH(OH);


    const alpha =
        A / C;


    const percentDissociation =
        alpha * 100;


    const pKa =
        -safeLog10(acidConstant);


    return {

        type: "weak-acid",

        initialConcentration: C,

        Ka: acidConstant,

        pKa,

        H,

        OH,

        HA,

        A,

        pH,

        pOH,

        degreeOfDissociation: alpha,

        percentDissociation,

        temperature: 25

    };

}


/* ==================================================
   WEAK BASE
==================================================

B + H2O ⇌ BH+ + OH-

Kb = [BH+][OH-] / [B]

Mass balance:

C = [B] + [BH+]

Using [OH-] = o:

[BH+] =
Kb*C / (Kb + o)

[H+] =
Kw / o

Charge balance:

o = [BH+] + [OH- from water]

The numerical solver finds OH directly.
================================================== */

function calculateWeakBase(
    concentration,
    Kb
) {

    const C =
        validateConcentration(concentration);

    const baseConstant =
        validateConstant(
            Kb,
            "Kb"
        );

    const Kw =
        CHEMISTRY_CONSTANTS.Kw25;


    const chargeBalance =
        (OH) => {

            const BH =
                (
                    baseConstant * C
                ) /
                (
                    baseConstant + OH
                );


            const H =
                Kw / OH;


            return OH - BH - H;

        };


    const OH =
        solvePositiveRootLogScale(
            chargeBalance,
            1e-14,
            Math.max(1, C)
        );


    const BH =
        (
            baseConstant * C
        ) /
        (
            baseConstant + OH
        );


    const B =
        C - BH;


    const H =
        Kw / OH;


    const pOH =
        calculatePohFromOH(OH);


    const pH =
        calculatePHFromH(H);


    const alpha =
        BH / C;


    const percentDissociation =
        alpha * 100;


    const pKb =
        -safeLog10(baseConstant);


    return {

        type: "weak-base",

        initialConcentration: C,

        Kb: baseConstant,

        pKb,

        H,

        OH,

        B,

        BH,

        pH,

        pOH,

        degreeOfDissociation: alpha,

        percentDissociation,

        temperature: 25

    };

}


/* ==================================================
   CONVERT Ka / Kb
================================================== */

function calculateKbFromKa(Ka) {

    const acidConstant =
        validateConstant(
            Ka,
            "Ka"
        );

    return CHEMISTRY_CONSTANTS.Kw25 /
        acidConstant;

}


function calculateKaFromKb(Kb) {

    const baseConstant =
        validateConstant(
            Kb,
            "Kb"
        );

    return CHEMISTRY_CONSTANTS.Kw25 /
        baseConstant;

}


function calculatePka(Ka) {

    return -safeLog10(
        validateConstant(Ka, "Ka")
    );

}


function calculatePkb(Kb) {

    return -safeLog10(
        validateConstant(Kb, "Kb")
    );

}


/* ==================================================
   EXPORT TO BROWSER
================================================== */

window.ChemistryEngine = {

    constants:
        CHEMISTRY_CONSTANTS,

    strongAcid:
        calculateStrongAcid,

    strongBase:
        calculateStrongBase,

    weakAcid:
        calculateWeakAcid,

    weakBase:
        calculateWeakBase,

    KbFromKa:
        calculateKbFromKa,

    KaFromKb:
        calculateKaFromKb,

    pKa:
        calculatePka,

    pKb:
        calculatePkb

};
