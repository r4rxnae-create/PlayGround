// FrozenDharma module build rules (UE5 target).
using UnrealBuildTool;
public class FrozenDharma : ModuleRules {
  public FrozenDharma(ReadOnlyTargetRules Target) : base(Target) {
    PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;
    PublicDependencyModuleNames.AddRange(new string[] {
      "Core","CoreUObject","Engine","InputCore","EnhancedInput",
      "GameplayAbilities","GameplayTags","GameplayTasks","AIModule","Niagara","Chaos"
    });
  }
}
