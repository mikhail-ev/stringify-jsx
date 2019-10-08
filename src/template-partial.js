import types from '@babel/types';

export default class TemplatePartial {
    constructor() {
        this.quasis = [];
        this.expressions = [];
    }

    addQuasi(quasi) {
        if (this.quasis.length === this.expressions.length + 1) {
            const lastQuasi = this.quasis[this.quasis.length - 1];
            this.quasis[this.quasis.length - 1] = lastQuasi.concat(quasi);
        } else {
            this.quasis.push(quasi);
        }
        return this;
    }

    addExpression(expression) {
        if (this.expressions.length === this.quasis.length) {
            this.quasis.push('');
        }
        this.expressions.push(expression);
        return this;
    }

    concat(templatePartial) {
        if (templatePartial.quasis.length < templatePartial.expressions.length) {
            throw new Error('Trying to concat invalid template: ' + JSON.stringify(templatePartial));
        }
        for (let i = 0; i < templatePartial.quasis.length; ++i) {
            this.addQuasi(templatePartial.quasis[i]);
            if (templatePartial.expressions[i]) {
                this.addExpression(templatePartial.expressions[i]);
            }
        }
        return this;
    }

    toTemplate() {
        if (this.quasis.length === this.expressions.length) {
            this.quasis.push('');
        }
        const lastIndex = this.quasis.length - 1;
        const elements = this.quasis.map((quasi, i) =>
            types.templateElement({raw: quasi}, i === lastIndex));
        return types.templateLiteral(elements, this.expressions);
    }
}