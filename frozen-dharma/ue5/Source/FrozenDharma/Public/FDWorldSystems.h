// UFDWorldConfig / Quest / Weather subsystems (UE5 target).
#pragma once
#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "FDWorldSystems.generated.h"
UCLASS() class FROZENDHARMA_API UFDWorldConfig : public UObject {
  GENERATED_BODY()
public:
  UFUNCTION(BlueprintCallable) static FName RegionForLevel(int32 Lvl);
  UFUNCTION(BlueprintCallable) static int32 PhaseForBoss(const FName& Id,float HPFrac);
};
UCLASS() class FROZENDHARMA_API UFDQuestSystem : public UActorComponent {
  GENERATED_BODY()
public:
  UFUNCTION(BlueprintCallable) void AcceptQuest(const FName& Q);
  UFUNCTION(BlueprintCallable) void AdvanceStage(const FName& Q);
};
UCLASS() class FROZENDHARMA_API UFDWeatherSubsystem : public UWorldSubsystem {
  GENERATED_BODY()
public:
  UFUNCTION(BlueprintCallable) void SetWeather(const FName& W);
  UFUNCTION(BlueprintCallable) float FireMultiplier() const;
};
