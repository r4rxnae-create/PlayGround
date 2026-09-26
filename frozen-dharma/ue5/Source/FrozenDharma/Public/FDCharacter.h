// AFDCharacter — third-person mythic protagonist (UE5 target header).
// Spring-arm camera, locomotion/traversal state machine, lock-on, cloth cloak.
#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "FDCharacter.generated.h"
class UFDCombatComponent; class UFDResonanceSystem;
UCLASS() class FROZENDHARMA_API AFDCharacter : public ACharacter {
  GENERATED_BODY()
public:
  AFDCharacter();
  UPROPERTY(VisibleAnywhere) class USpringArmComponent* CameraBoom;
  UPROPERTY(VisibleAnywhere) class UCameraComponent* FollowCamera;
  UPROPERTY(VisibleAnywhere) UFDCombatComponent* Combat;
  UPROPERTY(VisibleAnywhere) UFDResonanceSystem* Resonance;
  UFUNCTION(BlueprintCallable) void RequestDodge();
  UFUNCTION(BlueprintCallable) void RequestParry();
  UFUNCTION(BlueprintCallable) void RequestTraversal(const FName& Action); // Climb/Swim/Glide/Mount/Grapple
  UFUNCTION(BlueprintCallable) void SetLockOnTarget(AActor* T);
};
