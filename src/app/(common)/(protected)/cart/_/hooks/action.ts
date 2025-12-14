'use server';

import { getCurrentUser } from '@/lib/auth/get-current-user';
import { serverCartService, serverWishlistService } from '@/services/server-service-clients';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function removeFromCartAction(courseId: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      redirect('/login');
    }
    // const token = getCookieFromServer(authCookieToken);

    const response = await serverCartService.removeFromCart(courseId);

    // const response = await fetch(`${config.apiUrl}/carts/me`, {
    //   method: 'DELETE',
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //     'Content-Type': 'application/json',
    //   },
    // });

    if (!response.success) {
      throw new Error(response.message || 'Failed to remove from cart');
    }

    revalidatePath('/cart');
    return { success: true };
  } catch (error) {
    console.error('Error removing from cart:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// export async function updateCartQuantityAction(courseId: string, quantity: number) {
//   try {
//     const user = await getCurrentUser();

//     if (!user) {
//       redirect('/login');
//     }

//     const response = await (`${process.env.API_URL}/cart/${courseId}`,
//     {
//       method: 'PATCH',
//       headers: {
//         Authorization: `Bearer ${user.token}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ quantity }),
//     });

//     if (!response.ok) {
//       throw new Error('Failed to update quantity');
//     }

//     revalidatePath('/cart');
//     return { success: true };
//   } catch (error) {
//     console.error('Error updating cart quantity:', error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : 'Unknown error',
//     };
//   }
// }

export async function addToWishlistAction(courseId: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      redirect('/login');
    }

    // Add to wishlist
    const wishlistResponse = await serverWishlistService.addToWishlist(courseId);

    if (!wishlistResponse.success) {
      throw new Error(wishlistResponse.message || 'Failed to add to wishlist');
    }

    // Remove from cart
    // const cartResponse = await fetch(`${process.env.API_URL}/cart/${courseId}`, {
    //   method: 'DELETE',
    //   headers: {
    //     Authorization: `Bearer ${user.token}`,
    //     'Content-Type': 'application/json',
    //   },
    // });
    const cartResponse = await serverCartService.removeFromCart(courseId);

    if (!cartResponse.success) {
      throw new Error('Failed to remove from cart');
    }

    revalidatePath('/cart');
    revalidatePath('/wishlist');
    return { success: true };
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
