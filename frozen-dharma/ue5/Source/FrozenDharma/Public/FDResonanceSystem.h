// UFDResonanceSystem — 6 Dharma attunements + fusion table (UE5 target).
#pragma once
#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "FDResonanceSystem.generated.h"
UENUM() enum class EDharma : uint8 { Agni,Vayu,Varuna,Prithvi,Akasha,Kala };
UCLASS() class FROZENDHARMA_API UFDResonanceSystem : public UActorComponent {
  GENERATED_BODY()
public:
  UPROPERTY(EditAnywhere) TSet<EDharma> Unlocked;
  UPROPERTY(VisibleAnywhere) float Meter=0;
  UFUNCTION(BlueprintCallable) void Cast(EDharma D);
  UFUNCTION(BlueprintCallable) FName Fuse(EDharma A, EDharma B); // e.g. FirestormVortex
  UFUNCTION(BlueprintCallable) void Ultimate();
};
