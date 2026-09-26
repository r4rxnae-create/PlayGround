// UFDCombatComponent — GAS-based timing combat (UE5 target header).
#pragma once
#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "FDCombatComponent.generated.h"
UCLASS() class FROZENDHARMA_API UFDCombatComponent : public UActorComponent {
  GENERATED_BODY()
public:
  UPROPERTY(EditAnywhere) float MaxHealth=100, MaxStamina=100, Poise=100;
  UFUNCTION(BlueprintCallable) void LightAttack();
  UFUNCTION(BlueprintCallable) void HeavyAttack();
  UFUNCTION(BlueprintCallable) void ChargedAttack(float Hold);
  UFUNCTION(BlueprintCallable) bool TryDodge();    // i-frames 0.25s
  UFUNCTION(BlueprintCallable) bool TryParry();    // 0.18s window
  UFUNCTION(BlueprintCallable) bool TryBlock(bool b);
  UFUNCTION(BlueprintCallable) void ApplyHit(float Dmg,float PoiseDmg);
};
