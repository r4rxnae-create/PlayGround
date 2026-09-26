// AFDBossBase — phased boss with arena + cinematic intro (UE5 target).
#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "FDBossBase.generated.h"
UCLASS() class FROZENDHARMA_API AFDBossBase : public ACharacter {
  GENERATED_BODY()
public:
  UPROPERTY(EditAnywhere) FName BossId; UPROPERTY(EditAnywhere) int32 Phases=3;
  UFUNCTION(BlueprintCallable) virtual void AdvancePhase();
  UFUNCTION(BlueprintCallable) virtual void PlayIntro(); // Sequencer
};
