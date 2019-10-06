class MyComponent {
    render() {
        const id = "myButton"
        return (
            <div>
                <label htmlFor={id}/>
                <button id={id} type="submit"/>
            </div>
        );
    }
}