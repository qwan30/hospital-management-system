package com.hospital.core.user;

import com.hospital.shared.enums.UserRole;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {
  Optional<UserEntity> findByEmailIgnoreCaseAndActiveTrue(String email);

  boolean existsByEmailIgnoreCase(String email);

  Optional<UserEntity> findByIdAndRoleAndActiveTrue(UUID id, UserRole role);

  List<UserEntity> findByRoleAndActiveTrueOrderByFullNameAsc(UserRole role);

  List<UserEntity> findAllByOrderByFullNameAsc();

  long countByRoleAndActiveTrue(UserRole role);
}
