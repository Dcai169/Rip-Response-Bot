export function evaluateReplace(expression: any, {replacement = expression , callback = (res: any) => { return res; }, evalTarget = false} = { }): any {
    return (!!expression === evalTarget ? replacement : callback(expression));
}
