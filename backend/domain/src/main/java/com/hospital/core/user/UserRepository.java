package com.hospital.core.user;

import com.hospital.shared.enums.UserRole;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {
  Optional<UserEntity> findByEmailIgnoreCaseAndActiveTrue(String email);

  @Lock(LockModeType.PESSIMISTIC_READ)
  @Query("select user from UserEntity user where user.id = :id and user.active = true")
  Optional<UserEntity> findActiveByIdForRefresh(@Param("id") UUID id);

  boolean existsByEmailIgnoreCase(String email);

  Optional<UserEntity> findByIdAndRoleAndActiveTrue(UUID id, UserRole role);

  List<UserEntity> findByRoleAndActiveTrueOrderByFullNameAsc(UserRole role);

  List<UserEntity> findAllByOrderByFullNameAsc();

  long countByRoleAndActiveTrue(UserRole role);
}
