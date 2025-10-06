import type { CARSFormInput } from "../schemas/cars-form.schema";

export function calculateTotalScore(data: CARSFormInput): number {
  return (
    data.personalRelationships.score +
    data.imitation.score +
    data.emotionalResponse.score +
    data.bodyUse.score +
    data.objectUse.score +
    data.responseToChange.score +
    data.visualResponse.score +
    data.auditoryResponse.score +
    data.tasteSmelLTouch.score +
    data.fearOrNervousness.score +
    data.verbalCommunication.score +
    data.nonVerbalCommunication.score +
    data.activityLevel.score +
    data.intellectualResponse.score +
    data.generalImpressions.score
  );
}

export function mapCARSFormToPrisma(data: CARSFormInput, totalScore: number) {
  return {
    personalRelationshipsScore: data.personalRelationships.score,
    personalRelationshipsObservations: data.personalRelationships.observations,
    imitationScore: data.imitation.score,
    imitationObservations: data.imitation.observations,
    emotionalResponseScore: data.emotionalResponse.score,
    emotionalResponseObservations: data.emotionalResponse.observations,
    bodyUseScore: data.bodyUse.score,
    bodyUseObservations: data.bodyUse.observations,
    objectUseScore: data.objectUse.score,
    objectUseObservations: data.objectUse.observations,
    responseToChangeScore: data.responseToChange.score,
    responseToChangeObservations: data.responseToChange.observations,
    visualResponseScore: data.visualResponse.score,
    visualResponseObservations: data.visualResponse.observations,
    auditoryResponseScore: data.auditoryResponse.score,
    auditoryResponseObservations: data.auditoryResponse.observations,
    tasteSmelLTouchScore: data.tasteSmelLTouch.score,
    tasteSmelLTouchObservations: data.tasteSmelLTouch.observations,
    fearOrNervousnessScore: data.fearOrNervousness.score,
    fearOrNervousnessObservations: data.fearOrNervousness.observations,
    verbalCommunicationScore: data.verbalCommunication.score,
    verbalCommunicationObservations: data.verbalCommunication.observations,
    nonVerbalCommunicationScore: data.nonVerbalCommunication.score,
    nonVerbalCommunicationObservations: data.nonVerbalCommunication.observations,
    activityLevelScore: data.activityLevel.score,
    activityLevelObservations: data.activityLevel.observations,
    intellectualResponseScore: data.intellectualResponse.score,
    intellectualResponseObservations: data.intellectualResponse.observations,
    generalImpressionsScore: data.generalImpressions.score,
    generalImpressionsObservations: data.generalImpressions.observations,
    totalScore,
  };
}
