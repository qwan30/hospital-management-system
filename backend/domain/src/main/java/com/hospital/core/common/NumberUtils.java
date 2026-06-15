package com.hospital.core.common;

import java.math.BigDecimal;

public final class NumberUtils {

  private NumberUtils() {
    // utility class
  }

  public static BigDecimal toBigDecimal(Double value) {
    return value == null ? null : BigDecimal.valueOf(value);
  }

  public static Double toDouble(BigDecimal value) {
    return value == null ? null : value.doubleValue();
  }
}
