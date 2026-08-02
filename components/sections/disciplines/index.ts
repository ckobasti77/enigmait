// `DisciplinesSection` and not `Disciplines`: the section's public face is the SERVER
// component, which emits the ItemList graph into the served HTML and hands the interactive
// shell down. Importing the shell directly would drop the structured data.
export { default as Disciplines } from "./DisciplinesSection";
export { default as DisciplineStage } from "./DisciplineStage";
export { default as DisciplineModel } from "./DisciplineModel";
export { default as DisciplineCopy } from "./DisciplineCopy";
export { default as DisciplineStepper } from "./DisciplineStepper";
export { useDisciplineIndex } from "./useDisciplineIndex";
