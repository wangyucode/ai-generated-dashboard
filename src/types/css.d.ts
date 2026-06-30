declare module "*.css" {
    const content: { [className: string]: string };
    export default content;
}

declare module "*.css" {
    // This allows side-effect imports like: import "./style.css"
}
