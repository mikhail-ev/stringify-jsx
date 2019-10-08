class MyComponent {
    render() {
        const id = "myButton";
        return f(
            <div id={id} value="10" className={f()}>
                <label htmlFor={id}/>
                <button id={id} type="submit"/>
                Hello World! {id}
            </div>);
    }
}

function f() {

}